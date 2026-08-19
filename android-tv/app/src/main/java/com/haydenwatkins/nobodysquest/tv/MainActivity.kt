package com.haydenwatkins.nobodysquest.tv

import android.annotation.SuppressLint
import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.webkit.WebViewCompat
import androidx.webkit.WebViewFeature

/**
 * Thin Android TV shell around the live GitHub Pages build of Nobody's
 * Quest. The web game stays the single canonical game: this activity only
 * provides a hardware-accelerated fullscreen WebView, controller input
 * bridging (see GamepadBridge), and load/error handling. Ordinary game
 * updates arrive by pushing to GitHub — no APK rebuild involved.
 */
class MainActivity : Activity() {

    companion object {
        private const val TAG = "NQPad"

        // The one trusted origin. This wrapper is not a browser: navigation
        // and the native bridge are both locked to it.
        private const val GAME_ORIGIN = "https://haydenwatkins.github.io"
        private const val GAME_URL = "$GAME_ORIGIN/Nobodys-Quest/"

        // js/engine/input.js reads this to know it is on TV (hide touch UI,
        // accept the native virtual gamepad). Version the suffix if the
        // signal ever needs to change meaning.
        private const val UA_SUFFIX = " NobodysQuestTV/1.0"
    }

    private lateinit var webView: WebView
    private lateinit var statusOverlay: LinearLayout
    private lateinit var statusText: TextView
    private lateinit var retryButton: Button
    private lateinit var debugOverlay: TextView
    private lateinit var bridge: GamepadBridge

    private var errorShowing = false
    private var triedCacheFallback = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.game_web_view)
        statusOverlay = findViewById(R.id.status_overlay)
        statusText = findViewById(R.id.status_text)
        retryButton = findViewById(R.id.retry_button)
        debugOverlay = findViewById(R.id.debug_overlay)
        retryButton.setOnClickListener { retry() }

        configureWebView()

        bridge = GamepadBridge(webView)
        bridge.onDebugGesture = { toggleDebugOverlay() }
        bridge.debugListener = { snapshot -> debugOverlay.text = snapshot }
        // adb shell am start -n com.haydenwatkins.nobodysquest.tv/.MainActivity --ez debug true
        if (intent.getBooleanExtra("debug", false)) toggleDebugOverlay()

        // Modern, origin-locked native->JS channel. input.js posts "ready"
        // once per page load; the reply proxy handed back is our push pipe.
        if (WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            WebViewCompat.addWebMessageListener(
                webView, "nqTvBridge", setOf(GAME_ORIGIN)
            ) { _, message, _, isMainFrame, replyProxy ->
                if (isMainFrame && message.data == "ready") bridge.attachReplyProxy(replyProxy)
            }
        } else {
            Log.w(TAG, "WebMessageListener unsupported; using evaluateJavascript fallback")
        }

        showLoading()
        webView.loadUrl(GAME_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun configureWebView() {
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true // localStorage carries the save files
            // Controller input is consumed natively, so the page never gets a
            // browser "user gesture". Without this, WebAudio would stay
            // silently suspended forever.
            mediaPlaybackRequiresUserGesture = false
            cacheMode = WebSettings.LOAD_DEFAULT
            textZoom = 100 // the game draws its own text; ignore TV font scaling
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            userAgentString = userAgentString + UA_SUFFIX
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            allowFileAccess = false
            allowContentAccess = false
        }
        webView.setBackgroundColor(Color.BLACK)
        webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false)
        // The page is a fixed-size canvas: it must never scroll, select text,
        // or pop context menus on TV.
        webView.isVerticalScrollBarEnabled = false
        webView.isHorizontalScrollBarEnabled = false
        webView.overScrollMode = View.OVER_SCROLL_NEVER
        webView.isLongClickable = false
        webView.setOnLongClickListener { true }
        webView.isHapticFeedbackEnabled = false
        webView.webViewClient = GameWebViewClient()
        webView.webChromeClient = WebChromeClient() // defaults; grants nothing
    }

    /* ---------------- controller interception ----------------
       Gamepad events are consumed here, BEFORE WebView can turn them into
       focus navigation, scrolling, or cursor movement. Everything else
       (TV remote, including Back-to-exit) keeps stock behavior. */

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        // While the native status overlay is up, the controller drives it
        // instead of the (still loading or failed) page.
        if (statusOverlay.visibility == View.VISIBLE) {
            when (event.keyCode) {
                KeyEvent.KEYCODE_BUTTON_A -> {
                    if (event.action == KeyEvent.ACTION_UP && retryButton.visibility == View.VISIBLE) retry()
                    return true
                }
                KeyEvent.KEYCODE_BUTTON_B -> {
                    if (event.action == KeyEvent.ACTION_UP) finish()
                    return true
                }
            }
            return super.dispatchKeyEvent(event)
        }
        if (bridge.handleKeyEvent(event)) return true
        return super.dispatchKeyEvent(event)
    }

    override fun dispatchGenericMotionEvent(event: MotionEvent): Boolean {
        if (bridge.handleMotionEvent(event)) return true
        return super.dispatchGenericMotionEvent(event)
    }

    /* ---------------- lifecycle ---------------- */

    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
        bridge.start()
        enterImmersiveMode()
    }

    override fun onPause() {
        bridge.releaseAll() // nothing may stay "held" while we are backgrounded
        bridge.stop()
        webView.onPause()
        webView.pauseTimers()
        super.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) enterImmersiveMode()
    }

    @Suppress("DEPRECATION")
    private fun enterImmersiveMode() {
        // The classic flags work on every TV Android version we support and
        // avoid pulling in extra window-inset plumbing for a set-and-forget
        // fullscreen game surface.
        window.decorView.systemUiVisibility = (View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION)
    }

    /* ---------------- load / error handling ---------------- */

    private inner class GameWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            // Drop any navigation that leaves the game. External links (if
            // the game ever grows any) simply do nothing on TV.
            val url = request.url.toString()
            val allowed = url.startsWith(GAME_URL)
            if (!allowed) Log.w(TAG, "Blocked navigation to $url")
            return !allowed
        }

        override fun onPageCommitVisible(view: WebView, url: String) {
            if (!errorShowing) hideStatus()
        }

        override fun onPageFinished(view: WebView, url: String) {
            if (!errorShowing) {
                hideStatus()
                triedCacheFallback = false
                view.settings.cacheMode = WebSettings.LOAD_DEFAULT
                view.requestFocus()
            }
            bridge.onPageReady() // no-op on the WebMessageListener transport
        }

        override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
            if (request.isForMainFrame) onMainFrameFailed(error.description?.toString() ?: "network error")
        }

        override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, response: WebResourceResponse) {
            if (request.isForMainFrame) onMainFrameFailed("HTTP ${response.statusCode}")
        }

        override fun onRenderProcessGone(view: WebView, detail: RenderProcessGoneDetail): Boolean {
            // If Android kills the WebView renderer (OOM, crash), returning
            // false would crash the whole app. Rebuild the activity instead:
            // the game reloads from GitHub Pages and localStorage saves are
            // untouched.
            Log.e(TAG, "WebView render process gone (didCrash=${detail.didCrash()}); restarting activity")
            recreate()
            return true
        }
    }

    private fun onMainFrameFailed(reason: String) {
        Log.w(TAG, "Main frame failed: $reason")
        if (!triedCacheFallback) {
            // One quiet retry from WebView's ordinary HTTP cache. This keeps
            // the game playable through a router blip without inventing a
            // service worker or a second bundled copy of the game.
            triedCacheFallback = true
            errorShowing = false
            webView.settings.cacheMode = WebSettings.LOAD_CACHE_ELSE_NETWORK
            statusText.text = getString(R.string.status_offline_retry)
            retryButton.visibility = View.GONE
            statusOverlay.visibility = View.VISIBLE
            webView.loadUrl(GAME_URL)
            return
        }
        errorShowing = true
        webView.visibility = View.INVISIBLE // hide WebView's own error page
        statusText.text = getString(R.string.status_error, reason)
        retryButton.visibility = View.VISIBLE
        statusOverlay.visibility = View.VISIBLE
        retryButton.requestFocus()
    }

    private fun retry() {
        errorShowing = false
        triedCacheFallback = false
        webView.settings.cacheMode = WebSettings.LOAD_DEFAULT
        showLoading()
        webView.loadUrl(GAME_URL)
    }

    private fun showLoading() {
        webView.visibility = View.VISIBLE
        statusText.text = getString(R.string.status_loading)
        retryButton.visibility = View.GONE
        statusOverlay.visibility = View.VISIBLE
    }

    private fun hideStatus() {
        statusOverlay.visibility = View.GONE
        webView.visibility = View.VISIBLE
    }

    /* ---------------- diagnostics ---------------- */

    private fun toggleDebugOverlay() {
        val show = debugOverlay.visibility != View.VISIBLE
        debugOverlay.visibility = if (show) View.VISIBLE else View.GONE
        bridge.debugEnabled = show
        if (show) {
            debugOverlay.text = "controller: ${bridge.controllerLabel()}\nwaiting for input…"
        }
    }
}
