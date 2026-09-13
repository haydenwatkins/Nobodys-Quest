package com.haydenwatkins.nobodysquest.tv

import android.annotation.SuppressLint
import android.content.Context
import android.hardware.input.InputManager
import android.util.Log
import android.view.Choreographer
import android.view.InputDevice
import android.view.InputEvent
import android.view.KeyEvent
import android.view.MotionEvent
import android.webkit.WebView
import androidx.webkit.JavaScriptReplyProxy
import org.json.JSONObject
import kotlin.math.abs
import kotlin.math.roundToInt

/**
 * Streams raw Xbox/standard controller state from Android into the web game.
 *
 * Android WebView never delivers controller input as browser Gamepad API
 * events — it turns it into focus navigation and cursor behavior instead.
 * So MainActivity intercepts gamepad Key/MotionEvents before WebView sees
 * them and hands them here. This class only NORMALIZES them into the W3C
 * standard-gamepad shape (see StandardGamepad); every gameplay decision
 * stays in js/engine/input.js, which consumes this state through the exact
 * same code path as a real browser gamepad.
 *
 * Transport: androidx WebMessageListener. It is origin-locked to the game's
 * GitHub Pages origin and gives us a JavaScriptReplyProxy for native->JS
 * pushes without evaluating script strings. The page's input.js posts
 * "ready" once per load, which is when we receive that proxy. On WebViews
 * too old for the feature we fall back to evaluateJavascript() — slightly
 * more per-message overhead (script parse on the JS main thread) but
 * identical message payloads and behavior.
 *
 * Rate control: digital button edges flush immediately because reaction
 * latency matters most there. Analog motion (sticks/triggers/hat) is
 * coalesced to at most one message per display frame via Choreographer, so
 * stick wiggle can never flood the WebView with redundant messages. Message
 * strings are built into a reused StringBuilder; the JS side mutates one
 * pre-allocated pad object, so steady-state input allocates almost nothing
 * on either side.
 *
 * Wire protocol (JSON, native -> JS):
 *   {"t":"c","id":"Xbox Wireless Controller"}   controller connected
 *   {"t":"d"}                                    controller disconnected
 *   {"t":"s","a":[lx,ly,rx,ry],"b":[17 values]}  full state snapshot
 */
class GamepadBridge(private val webView: WebView) : InputManager.InputDeviceListener {

    companion object {
        private const val TAG = "NQPad"
        private const val AXIS_EPSILON = 0.002f
    }

    private val axes = FloatArray(4)
    private val buttons = FloatArray(StandardGamepad.BUTTON_COUNT)
    private val axisConfigs = HashMap<Int, StandardGamepad.AxisConfig>()
    private val choreographer: Choreographer = Choreographer.getInstance()
    private val inputManager =
        webView.context.getSystemService(Context.INPUT_SERVICE) as InputManager
    private val json = StringBuilder(192)

    private var replyProxy: JavaScriptReplyProxy? = null
    private var connected = false
    private var padName = ""
    private var padDescriptor = ""
    private var flushScheduled = false
    private var flushCount = 0

    /** Fired when both stick buttons are clicked together (debug overlay toggle). */
    var onDebugGesture: (() -> Unit)? = null

    /** When true, [debugListener] receives a readable snapshot after each flush. */
    var debugEnabled = false
    var debugListener: ((String) -> Unit)? = null

    private val frameCallback = Choreographer.FrameCallback {
        flushScheduled = false
        flushNow()
    }

    /** Call from Activity.onResume. */
    fun start() {
        inputManager.registerInputDeviceListener(this, null)
        rescanDevices()
    }

    /** Call from Activity.onPause, after [releaseAll]. */
    fun stop() {
        inputManager.unregisterInputDeviceListener(this)
    }

    /**
     * Consumes a gamepad button event. Returns false for anything that is
     * not a game-controller button (TV remote keys, volume, ...), so normal
     * Android behavior — including the remote's Back — is untouched.
     */
    fun handleKeyEvent(event: KeyEvent): Boolean {
        if (!isGamepadEvent(event)) return false
        val index = StandardGamepad.buttonIndexForKeyCode(event.keyCode) ?: return false
        ensureConnected(event.device)
        if (event.repeatCount > 0) return true // swallow auto-repeat; state is already correct
        val value = if (event.action == KeyEvent.ACTION_DOWN) 1f else 0f
        if (buttons[index] != value) {
            buttons[index] = value
            flushNow() // button edges skip coalescing: latency matters most here
            if (value == 1f &&
                buttons[StandardGamepad.INDEX_THUMBL] == 1f &&
                buttons[StandardGamepad.INDEX_THUMBR] == 1f &&
                (index == StandardGamepad.INDEX_THUMBL || index == StandardGamepad.INDEX_THUMBR)
            ) {
                onDebugGesture?.invoke()
            }
        }
        return true
    }

    /**
     * Consumes joystick motion (sticks, analog triggers, D-pad hat). Returning
     * true here is what stops WebView from turning stick input into scrolling
     * or a cursor.
     */
    fun handleMotionEvent(event: MotionEvent): Boolean {
        if (!isGamepadEvent(event)) return false
        if (event.actionMasked != MotionEvent.ACTION_MOVE) return false
        val device = event.device ?: return false
        ensureConnected(device)
        val config = axisConfigs.getOrPut(device.id) {
            val chosen = StandardGamepad.chooseAxisConfig(availableAxes(device))
            Log.i(TAG, "Axis layout for '${device.name}': $chosen")
            chosen
        }

        var changed = setAxis(0, event.getAxisValue(MotionEvent.AXIS_X))
        changed = setAxis(1, event.getAxisValue(MotionEvent.AXIS_Y)) || changed
        if (config.rightX != StandardGamepad.AXIS_NONE) {
            changed = setAxis(2, event.getAxisValue(config.rightX)) || changed
        }
        if (config.rightY != StandardGamepad.AXIS_NONE) {
            changed = setAxis(3, event.getAxisValue(config.rightY)) || changed
        }
        if (config.leftTrigger != StandardGamepad.AXIS_NONE) {
            changed = setButton(
                StandardGamepad.INDEX_LEFT_TRIGGER,
                normalizedTrigger(device, config.leftTrigger, event)
            ) || changed
        }
        if (config.rightTrigger != StandardGamepad.AXIS_NONE) {
            changed = setButton(
                StandardGamepad.INDEX_RIGHT_TRIGGER,
                normalizedTrigger(device, config.rightTrigger, event)
            ) || changed
        }

        // Only trust the hat when the device really has one; on hat-less pads
        // the D-pad arrives as KeyEvents and reading a missing axis (always
        // 0) would wrongly release those buttons.
        if (config.hasHat) {
            val hatX = event.getAxisValue(MotionEvent.AXIS_HAT_X)
            val hatY = event.getAxisValue(MotionEvent.AXIS_HAT_Y)
            changed = setButton(StandardGamepad.INDEX_DPAD_UP, if (hatY < -0.5f) 1f else 0f) || changed
            changed = setButton(StandardGamepad.INDEX_DPAD_DOWN, if (hatY > 0.5f) 1f else 0f) || changed
            changed = setButton(StandardGamepad.INDEX_DPAD_LEFT, if (hatX < -0.5f) 1f else 0f) || changed
            changed = setButton(StandardGamepad.INDEX_DPAD_RIGHT, if (hatX > 0.5f) 1f else 0f) || changed
        }

        if (changed) scheduleFlush()
        return true
    }

    /** Neutral state, flushed immediately. Call before the app loses focus. */
    fun releaseAll() {
        axes.fill(0f)
        buttons.fill(0f)
        flushNow()
    }

    /** New page load handshake (WebMessageListener transport). */
    fun attachReplyProxy(proxy: JavaScriptReplyProxy) {
        replyProxy = proxy
        Log.i(TAG, "Bridge attached via WebMessageListener")
        announce()
    }

    /**
     * Called after every page load. Only matters for the evaluateJavascript
     * fallback, where there is no "ready" handshake to re-announce through.
     */
    fun onPageReady() {
        if (replyProxy == null) announce()
    }

    fun isConnected() = connected
    fun controllerLabel() = if (padName.isEmpty()) "none" else padName

    /* ---------------- device tracking ---------------- */

    override fun onInputDeviceAdded(deviceId: Int) = rescanDevices()

    override fun onInputDeviceRemoved(deviceId: Int) {
        axisConfigs.remove(deviceId)
        rescanDevices()
    }

    override fun onInputDeviceChanged(deviceId: Int) {
        axisConfigs.remove(deviceId)
    }

    fun rescanDevices() {
        val device = InputDevice.getDeviceIds()
            .asSequence()
            .mapNotNull { InputDevice.getDevice(it) }
            .firstOrNull { isGamepadDevice(it) }
        if (device != null) {
            ensureConnected(device)
        } else if (connected) {
            connected = false
            padName = ""
            padDescriptor = ""
            axes.fill(0f)
            buttons.fill(0f)
            Log.i(TAG, "Controller disconnected")
            send("{\"t\":\"d\"}")
            publishDebug()
        }
    }

    private fun ensureConnected(device: InputDevice?) {
        val name = device?.name ?: "Controller"
        if (connected && name == padName) return
        connected = true
        padName = name
        padDescriptor = device?.descriptor?.take(12) ?: ""
        Log.i(TAG, "Controller active: $padName")
        sendConnect()
        publishDebug()
    }

    private fun isGamepadEvent(event: InputEvent): Boolean {
        val source = event.source
        return source and InputDevice.SOURCE_GAMEPAD == InputDevice.SOURCE_GAMEPAD ||
            source and InputDevice.SOURCE_JOYSTICK == InputDevice.SOURCE_JOYSTICK
    }

    private fun isGamepadDevice(device: InputDevice): Boolean {
        if (device.isVirtual) return false
        val sources = device.sources
        return sources and InputDevice.SOURCE_GAMEPAD == InputDevice.SOURCE_GAMEPAD ||
            sources and InputDevice.SOURCE_JOYSTICK == InputDevice.SOURCE_JOYSTICK
    }

    private fun availableAxes(device: InputDevice): Set<Int> =
        device.motionRanges.map { it.axis }.toSet()

    private fun normalizedTrigger(device: InputDevice, axis: Int, event: MotionEvent): Float {
        val range = device.getMotionRange(axis, event.source)
        return StandardGamepad.normalizeTrigger(
            event.getAxisValue(axis),
            range?.min ?: 0f,
            range?.max ?: 1f,
        )
    }

    /* ---------------- state + flushing ---------------- */

    private fun setAxis(index: Int, value: Float): Boolean {
        if (abs(axes[index] - value) < AXIS_EPSILON) return false
        axes[index] = value
        return true
    }

    private fun setButton(index: Int, value: Float): Boolean {
        if (abs(buttons[index] - value) < AXIS_EPSILON) return false
        buttons[index] = value
        return true
    }

    private fun scheduleFlush() {
        if (flushScheduled) return
        flushScheduled = true
        choreographer.postFrameCallback(frameCallback)
    }

    private fun flushNow() {
        if (!connected) return
        json.setLength(0)
        json.append("{\"t\":\"s\",\"a\":[")
        for (i in axes.indices) {
            if (i > 0) json.append(',')
            appendValue(axes[i])
        }
        json.append("],\"b\":[")
        for (i in buttons.indices) {
            if (i > 0) json.append(',')
            appendValue(buttons[i])
        }
        json.append("]}")
        send(json.toString())
        flushCount++
        publishDebug()
    }

    private fun appendValue(value: Float) {
        // Three decimals keeps messages short and stick precision intact.
        val scaled = (value * 1000f).roundToInt()
        if (scaled == 0) json.append('0') else json.append(scaled / 1000f)
    }

    private fun sendConnect() {
        send("{\"t\":\"c\",\"id\":" + JSONObject.quote(padName) + "}")
    }

    private fun announce() {
        if (!connected) return
        sendConnect()
        flushNow()
    }

    // Lint wants an isFeatureSupported(WEB_MESSAGE_LISTENER) check here, but
    // replyProxy can only be non-null when that feature was supported (it is
    // produced by addWebMessageListener in MainActivity, which does check).
    @SuppressLint("RequiresFeature")
    private fun send(message: String) {
        val proxy = replyProxy
        if (proxy != null) {
            proxy.postMessage(message)
        } else {
            // Fallback transport for WebViews without WebMessageListener.
            webView.evaluateJavascript(
                "window.__nqTvPad&&window.__nqTvPad(" + JSONObject.quote(message) + ");",
                null,
            )
        }
    }

    /* ---------------- diagnostics ---------------- */

    private fun publishDebug() {
        if (!debugEnabled) return
        val listener = debugListener ?: return
        val pressed = buttons.indices.filter { buttons[it] >= 0.5f }.joinToString(",")
        listener(
            """
            pad: ${if (connected) padName else "none detected"}
            desc: $padDescriptor
            link: ${if (replyProxy != null) "WebMessageListener" else "evaluateJavascript"}
            L %+.2f %+.2f   R %+.2f %+.2f
            LT %.2f  RT %.2f
            pressed: [$pressed]
            flushes: $flushCount
            """.trimIndent().format(
                axes[0], axes[1], axes[2], axes[3],
                buttons[StandardGamepad.INDEX_LEFT_TRIGGER],
                buttons[StandardGamepad.INDEX_RIGHT_TRIGGER],
            )
        )
    }
}
