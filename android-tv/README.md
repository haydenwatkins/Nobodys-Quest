# Nobody's Quest — Android TV / Google TV wrapper

A thin native shell that makes the existing web game feel like an installed
Google TV game. **The web game stays the single canonical game** — this app
contains no forms, enemies, maps, combat, UI, or rendering.

```
Xbox controller ──► Android KeyEvent/MotionEvent (MainActivity intercepts)
                ──► GamepadBridge (normalize to W3C standard-gamepad shape)
                ──► WebMessageListener (origin-locked JSON messages)
                ──► js/engine/input.js virtual pad
                ──► the game's existing Xbox mapping

GitHub Pages (https://haydenwatkins.github.io/Nobodys-Quest/)
                ──► hardware-accelerated Android WebView
                ──► existing Canvas renderer / WebAudio / localStorage saves
```

## Why the native controller bridge exists

Android WebView never delivers game-controller input to the page as browser
Gamepad API events — it turns it into focus navigation, scrolling, and cursor
behavior (which is exactly what TV Bro showed). GeckoView delivers gamepad
events but renders the game with noticeable lag, and streaming from a PC adds
latency. So: WebView for rendering, native code for the controller.

`MainActivity.dispatchKeyEvent` / `dispatchGenericMotionEvent` consume events
whose source is a gamepad/joystick **before** WebView sees them (no cursor, no
focus wandering) and hand them to `GamepadBridge`. TV-remote events are not
touched, so the remote's Back still exits the app normally.

## How the JS virtual gamepad works

The one Xbox action mapping lives in `js/engine/input.js` in the repo root,
exactly where it was. The bridge only ships **raw state**:

- `{"t":"c","id":"Xbox Wireless Controller"}` — controller connected
- `{"t":"d"}` — disconnected
- `{"t":"s","a":[lx,ly,rx,ry],"b":[17 button values]}` — full snapshot in the
  W3C standard-gamepad layout

`input.js` keeps one pre-allocated pad object shaped like a browser `Gamepad`,
mutates it from these messages, and feeds it through the **same
`updateGamepad()` code path** a real browser gamepad uses. Kotlin never sends
commands like "cast ability" — `StandardGamepad.kt` only translates Android
keycodes/axes (which vary by manufacturer) into standard indices.

Menu behavior is likewise owned by the shared web game: left stick/D-pad move
focus with console-style hold repeat, right stick scrolls continuously, A
confirms, B returns, L1/L2 navigate left, and R1/R2 navigate right. Because
this lives in JavaScript, iPhone/iPad browser controllers and the TV bridge
behave alike, and changing menu behavior does not require rebuilding the APK.

Transport is androidx `WebMessageListener`, allow-listed to
`https://haydenwatkins.github.io` only. The page posts `"ready"` once per
load; the reply proxy that produces is the native→JS push channel. Ancient
WebViews without the feature fall back to `evaluateJavascript` with identical
payloads (slightly more per-message overhead; same behavior). Button edges
flush immediately; analog motion is coalesced to one message per display
frame via Choreographer.

The wrapper also appends ` NobodysQuestTV/1.0` to the WebView user agent.
`input.js` reads that as the platform signal to hide the iPad touch buttons
(TV WebViews often report fake touch support) — iPad behavior is unchanged.

## Audio

The game creates/resumes its WebAudio context on first input. On TV that
input never reaches the page as a browser "user gesture", so the WebView is
configured with `mediaPlaybackRequiresUserGesture = false`. Launch the game,
press a button, music plays. No mouse/cursor click needed.

## Saves

The game's `localStorage` saves live in the app's WebView data directory.
They survive app restarts, TV reboots, and APK **updates**. They are erased
only if the app is **uninstalled** or its storage is cleared — which is why
signing consistency (below) matters: a signature mismatch forces an
uninstall.

## Game updates vs. APK rebuilds

Ordinary game work needs **no APK rebuild**:

```
edit the game → git push → GitHub Pages refreshes → TV app shows it next launch
```

You only rebuild/re-sideload the APK when the **wrapper itself** changes:
the game URL, the controller bridge/mapping *transport*, WebView settings,
icon/banner, or Android version targets. (Changes to what buttons *do* are
JS changes — no rebuild.)

## Building the APK

Requirements: Android Studio installed (for its SDK + bundled JDK), or any
JDK 17+ plus an Android SDK.

```powershell
cd android-tv
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
# one-time: point Gradle at the SDK (file is gitignored)
Set-Content local.properties "sdk.dir=C:/Users/<you>/AppData/Local/Android/Sdk"

.\gradlew.bat :app:assembleDebug     # quick dev build (debug-signed)
.\gradlew.bat :app:assembleRelease   # proper build (needs keystore.properties)
.\gradlew.bat :app:test              # controller-mapping unit tests
```

APK output:

- debug: `app/build/outputs/apk/debug/app-debug.apk`
- release: `app/build/outputs/apk/release/app-release.apk`

## Signing — read this before your second install

Android only installs an update **over** an existing app when both APKs are
signed with the same key. A different key forces uninstall → which deletes
localStorage → **which deletes the family's saves.**

- Debug builds use the machine's debug keystore
  (`C:\Users\<you>\.android\debug.keystore`). Fine for the first sideload,
  but it is per-PC: keep building on the same machine, or switch to a real
  key before anyone's save matters.
- Recommended: create a release keystore once and never lose it:

  ```powershell
  cd android-tv
  mkdir keystore
  & "C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair `
      -keystore keystore\nobodys-quest-release.jks -alias nobodys-quest `
      -keyalg RSA -keysize 2048 -validity 10950
  Copy-Item keystore.properties.example keystore.properties
  # then edit keystore.properties with the passwords you chose
  ```

  `keystore/` and `keystore.properties` are gitignored — **back the .jks file
  and passwords up somewhere private** (password manager, cloud drive). With
  them present, `assembleRelease` produces a signed, updatable APK.
- The application ID `com.haydenwatkins.nobodysquest.tv` is likewise
  permanent; changing it also orphans saves.
- For future updates, bump `versionCode` (and `versionName`) in
  `app/build.gradle.kts` — Android refuses to install the same or a lower
  `versionCode` over an existing install.

## Sideloading onto a Google TV

Option A — ADB over network (easiest from a PC):

1. On the TV: Settings → System → About → click **Android TV OS build**
   7 times to unlock Developer options, then Developer options → enable
   **USB debugging** / **Wireless debugging** (naming varies).
2. Find the TV's IP: Settings → Network & Internet.
3. From this repo (adb ships with Android Studio):
   ```powershell
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" connect <TV-IP>:5555
   # accept the debugging prompt on the TV, then:
   & "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" install -r android-tv\app\build\outputs\apk\debug\app-debug.apk
   ```
   `-r` = replace/update in place, keeping app data (saves).

Option B — no PC connection: copy the APK to a USB stick or cloud drive and
install it on the TV with a sideload helper app ("Send files to TV",
"Downloader", etc.), allowing "install unknown apps" for that helper when
prompted.

**Updating later:** build a new APK with the same signing key and a higher
`versionCode`, then `adb install -r` (or reinstall via the same sideload
app). Never uninstall first — that wipes saves.

## Troubleshooting

**Controller input**

- Toggle the diagnostics overlay by **clicking both sticks (L3+R3) at
  once**, or launch with
  `adb shell am start -n com.haydenwatkins.nobodysquest.tv/.MainActivity --ez debug true`.
  It shows the detected controller, transport, live stick/trigger values,
  and pressed standard-gamepad button indices.
- Logcat: `adb logcat -s NQPad` shows connects, the per-device axis layout
  chosen, and blocked navigations.
- Buttons in weird places → that controller reports nonstandard axes;
  `StandardGamepad.chooseAxisConfig` is where per-device normalization
  lives. The overlay tells you what the device actually sends.
- Controller works in menus but not the game → check the overlay's `link:`
  line; if the page never posted "ready", the web game version predates the
  TV bridge (hard-refresh: exit and relaunch the app).
- Xbox View button opens the Atlas by design (on old controller firmware it
  reports as BACK; the bridge claims BACK only from gamepad devices — the
  remote's Back still exits).

**WebView / audio**

- Black screen or "Could not load": the TV is offline or GitHub Pages is
  unreachable. The app auto-retries once from HTTP cache; after that, press
  A / select **Try again**. Best-effort offline works only while the cache
  is warm — full offline is intentionally out of scope (single source of
  truth beats a drifting bundled copy).
- No audio after pressing buttons: make sure the APK was built from this
  source (`mediaPlaybackRequiresUserGesture=false` is required) and the
  TV's WebView (Play Store → Android System WebView) is up to date.
- Sluggish rendering: update Android System WebView; the wrapper itself
  adds no layers above the game canvas.
