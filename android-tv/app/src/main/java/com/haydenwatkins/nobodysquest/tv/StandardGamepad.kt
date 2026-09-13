package com.haydenwatkins.nobodysquest.tv

import android.view.KeyEvent
import android.view.MotionEvent

/**
 * Pure mapping from Android's controller keycodes/axes to the W3C "standard
 * gamepad" layout that the web game's js/engine/input.js already understands:
 *
 *   buttons: 0 A · 1 B · 2 X · 3 Y · 4 LB · 5 RB · 6 LT · 7 RT ·
 *            8 View · 9 Menu · 10 L3 · 11 R3 · 12-15 D-pad · 16 Guide
 *   axes:    0/1 left stick · 2/3 right stick
 *
 * Only this translation lives in Kotlin. What the buttons DO (abilities,
 * form wheel, menus, aiming) stays in JavaScript, so both the browser
 * Gamepad API and this bridge run through one authoritative mapping.
 *
 * No Android objects beyond compile-time constants are used, which keeps
 * this testable in a plain JVM unit test.
 */
object StandardGamepad {

    const val BUTTON_COUNT = 17
    const val AXIS_NONE = -1

    const val INDEX_LEFT_TRIGGER = 6
    const val INDEX_RIGHT_TRIGGER = 7
    const val INDEX_THUMBL = 10
    const val INDEX_THUMBR = 11
    const val INDEX_DPAD_UP = 12
    const val INDEX_DPAD_DOWN = 13
    const val INDEX_DPAD_LEFT = 14
    const val INDEX_DPAD_RIGHT = 15

    /**
     * Standard-gamepad button index for an Android keycode, or null when the
     * key is not a gamepad button (so the caller must NOT consume it).
     */
    fun buttonIndexForKeyCode(keyCode: Int): Int? = when (keyCode) {
        KeyEvent.KEYCODE_BUTTON_A -> 0
        KeyEvent.KEYCODE_BUTTON_B -> 1
        KeyEvent.KEYCODE_BUTTON_X -> 2
        KeyEvent.KEYCODE_BUTTON_Y -> 3
        KeyEvent.KEYCODE_BUTTON_L1 -> 4
        KeyEvent.KEYCODE_BUTTON_R1 -> 5
        KeyEvent.KEYCODE_BUTTON_L2 -> INDEX_LEFT_TRIGGER
        KeyEvent.KEYCODE_BUTTON_R2 -> INDEX_RIGHT_TRIGGER
        // Xbox "View". Older Xbox Bluetooth firmware reports it as BACK;
        // callers only route gamepad-source events here, so the TV remote's
        // Back key keeps its normal leave-the-app behavior.
        KeyEvent.KEYCODE_BUTTON_SELECT, KeyEvent.KEYCODE_BACK -> 8
        KeyEvent.KEYCODE_BUTTON_START, KeyEvent.KEYCODE_MENU -> 9
        KeyEvent.KEYCODE_BUTTON_THUMBL -> INDEX_THUMBL
        KeyEvent.KEYCODE_BUTTON_THUMBR -> INDEX_THUMBR
        KeyEvent.KEYCODE_DPAD_UP -> INDEX_DPAD_UP
        KeyEvent.KEYCODE_DPAD_DOWN -> INDEX_DPAD_DOWN
        KeyEvent.KEYCODE_DPAD_LEFT -> INDEX_DPAD_LEFT
        KeyEvent.KEYCODE_DPAD_RIGHT -> INDEX_DPAD_RIGHT
        KeyEvent.KEYCODE_BUTTON_MODE -> 16
        else -> null
    }

    /**
     * Where a specific controller keeps its right stick, analog triggers and
     * D-pad hat. Manufacturers disagree, so this is chosen per device from
     * the set of axes the device actually reports.
     */
    data class AxisConfig(
        val rightX: Int,
        val rightY: Int,
        val leftTrigger: Int,
        val rightTrigger: Int,
        val hasHat: Boolean,
    )

    fun chooseAxisConfig(availableAxes: Set<Int>): AxisConfig {
        val hasZRz = MotionEvent.AXIS_Z in availableAxes && MotionEvent.AXIS_RZ in availableAxes
        val hasRxRy = MotionEvent.AXIS_RX in availableAxes && MotionEvent.AXIS_RY in availableAxes
        val hasTriggerAxes = MotionEvent.AXIS_LTRIGGER in availableAxes && MotionEvent.AXIS_RTRIGGER in availableAxes
        val hasBrakeGas = MotionEvent.AXIS_BRAKE in availableAxes && MotionEvent.AXIS_GAS in availableAxes
        val hasHat = MotionEvent.AXIS_HAT_X in availableAxes && MotionEvent.AXIS_HAT_Y in availableAxes

        val triggers: Pair<Int, Int> = when {
            hasTriggerAxes -> MotionEvent.AXIS_LTRIGGER to MotionEvent.AXIS_RTRIGGER
            hasBrakeGas -> MotionEvent.AXIS_BRAKE to MotionEvent.AXIS_GAS
            // DualShock-style pads park L2/R2 on RX/RY when nothing else fits.
            hasZRz && hasRxRy -> MotionEvent.AXIS_RX to MotionEvent.AXIS_RY
            else -> AXIS_NONE to AXIS_NONE
        }

        val rightStick: Pair<Int, Int> = when {
            // The common modern layout (current Xbox Bluetooth firmware,
            // most Android-certified pads): right stick on Z/RZ with real
            // trigger axes alongside.
            hasZRz -> MotionEvent.AXIS_Z to MotionEvent.AXIS_RZ
            hasRxRy && triggers.first != MotionEvent.AXIS_RX -> MotionEvent.AXIS_RX to MotionEvent.AXIS_RY
            else -> AXIS_NONE to AXIS_NONE
        }

        return AxisConfig(
            rightX = rightStick.first,
            rightY = rightStick.second,
            leftTrigger = triggers.first,
            rightTrigger = triggers.second,
            hasHat = hasHat,
        )
    }

    /**
     * Normalizes a trigger axis into the standard gamepad's 0..1 button value
     * whatever range the device reports (0..1 for LTRIGGER/BRAKE, -1..1 for
     * DualShock-style RX/RY triggers).
     */
    fun normalizeTrigger(value: Float, min: Float, max: Float): Float {
        if (max <= min) return if (value > 0f) 1f else 0f
        return ((value - min) / (max - min)).coerceIn(0f, 1f)
    }
}
