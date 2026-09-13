package com.haydenwatkins.nobodysquest.tv

import android.view.KeyEvent
import android.view.MotionEvent
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/**
 * The keycode/axis constants are compile-time ints, so these tests run on a
 * plain JVM without Robolectric. They pin down the ONE thing the native
 * layer owns: translating Android's controller shapes into the W3C standard
 * gamepad layout the web game expects.
 */
class StandardGamepadTest {

    @Test
    fun `xbox face buttons map to standard indices`() {
        assertEquals(0, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_A))
        assertEquals(1, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_B))
        assertEquals(2, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_X))
        assertEquals(3, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_Y))
    }

    @Test
    fun `bumpers triggers sticks and system buttons map correctly`() {
        assertEquals(4, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_L1))
        assertEquals(5, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_R1))
        assertEquals(6, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_L2))
        assertEquals(7, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_R2))
        assertEquals(8, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_SELECT))
        assertEquals(9, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_START))
        assertEquals(10, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_THUMBL))
        assertEquals(11, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_THUMBR))
        assertEquals(16, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BUTTON_MODE))
    }

    @Test
    fun `dpad keys map to standard indices`() {
        assertEquals(12, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_DPAD_UP))
        assertEquals(13, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_DPAD_DOWN))
        assertEquals(14, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_DPAD_LEFT))
        assertEquals(15, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_DPAD_RIGHT))
    }

    @Test
    fun `old xbox firmware view button reported as BACK still maps to view`() {
        assertEquals(8, StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_BACK))
    }

    @Test
    fun `non-gamepad keys are not claimed so the tv remote keeps working`() {
        assertNull(StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_VOLUME_UP))
        assertNull(StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_HOME))
        assertNull(StandardGamepad.buttonIndexForKeyCode(KeyEvent.KEYCODE_1))
    }

    @Test
    fun `modern xbox bluetooth layout uses z-rz right stick and trigger axes`() {
        val config = StandardGamepad.chooseAxisConfig(
            setOf(
                MotionEvent.AXIS_X, MotionEvent.AXIS_Y,
                MotionEvent.AXIS_Z, MotionEvent.AXIS_RZ,
                MotionEvent.AXIS_LTRIGGER, MotionEvent.AXIS_RTRIGGER,
                MotionEvent.AXIS_BRAKE, MotionEvent.AXIS_GAS,
                MotionEvent.AXIS_HAT_X, MotionEvent.AXIS_HAT_Y,
            )
        )
        assertEquals(MotionEvent.AXIS_Z, config.rightX)
        assertEquals(MotionEvent.AXIS_RZ, config.rightY)
        assertEquals(MotionEvent.AXIS_LTRIGGER, config.leftTrigger)
        assertEquals(MotionEvent.AXIS_RTRIGGER, config.rightTrigger)
        assertEquals(true, config.hasHat)
    }

    @Test
    fun `brake-gas pads fall back to those trigger axes`() {
        val config = StandardGamepad.chooseAxisConfig(
            setOf(
                MotionEvent.AXIS_X, MotionEvent.AXIS_Y,
                MotionEvent.AXIS_Z, MotionEvent.AXIS_RZ,
                MotionEvent.AXIS_BRAKE, MotionEvent.AXIS_GAS,
                MotionEvent.AXIS_HAT_X, MotionEvent.AXIS_HAT_Y,
            )
        )
        assertEquals(MotionEvent.AXIS_BRAKE, config.leftTrigger)
        assertEquals(MotionEvent.AXIS_GAS, config.rightTrigger)
    }

    @Test
    fun `dualshock-style pads park triggers on rx-ry`() {
        val config = StandardGamepad.chooseAxisConfig(
            setOf(
                MotionEvent.AXIS_X, MotionEvent.AXIS_Y,
                MotionEvent.AXIS_Z, MotionEvent.AXIS_RZ,
                MotionEvent.AXIS_RX, MotionEvent.AXIS_RY,
                MotionEvent.AXIS_HAT_X, MotionEvent.AXIS_HAT_Y,
            )
        )
        assertEquals(MotionEvent.AXIS_Z, config.rightX)
        assertEquals(MotionEvent.AXIS_RZ, config.rightY)
        assertEquals(MotionEvent.AXIS_RX, config.leftTrigger)
        assertEquals(MotionEvent.AXIS_RY, config.rightTrigger)
    }

    @Test
    fun `rx-ry right stick pads without z-rz are honored`() {
        val config = StandardGamepad.chooseAxisConfig(
            setOf(
                MotionEvent.AXIS_X, MotionEvent.AXIS_Y,
                MotionEvent.AXIS_RX, MotionEvent.AXIS_RY,
                MotionEvent.AXIS_LTRIGGER, MotionEvent.AXIS_RTRIGGER,
            )
        )
        assertEquals(MotionEvent.AXIS_RX, config.rightX)
        assertEquals(MotionEvent.AXIS_RY, config.rightY)
        assertEquals(false, config.hasHat)
    }

    @Test
    fun `pads with no analog triggers report none and rely on digital L2-R2 keys`() {
        val config = StandardGamepad.chooseAxisConfig(
            setOf(
                MotionEvent.AXIS_X, MotionEvent.AXIS_Y,
                MotionEvent.AXIS_Z, MotionEvent.AXIS_RZ,
            )
        )
        assertEquals(StandardGamepad.AXIS_NONE, config.leftTrigger)
        assertEquals(StandardGamepad.AXIS_NONE, config.rightTrigger)
    }

    @Test
    fun `trigger normalization handles 0-1 and -1-1 ranges`() {
        assertEquals(0.5f, StandardGamepad.normalizeTrigger(0.5f, 0f, 1f), 0.0001f)
        assertEquals(0.0f, StandardGamepad.normalizeTrigger(-1f, -1f, 1f), 0.0001f)
        assertEquals(0.5f, StandardGamepad.normalizeTrigger(0f, -1f, 1f), 0.0001f)
        assertEquals(1.0f, StandardGamepad.normalizeTrigger(1f, -1f, 1f), 0.0001f)
        assertEquals(1.0f, StandardGamepad.normalizeTrigger(2f, 0f, 1f), 0.0001f) // clamped
    }
}
