# Nobody's Quest TV launcher.
# Steam tracks this wrapper while Chrome owns the installed web-app window.

$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class NobodyQuestWindow {
    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Auto)]
    private struct MONITORINFO {
        public int cbSize;
        public RECT rcMonitor;
        public RECT rcWork;
        public uint dwFlags;
    }

    [DllImport("user32.dll")] private static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
    [DllImport("user32.dll")] private static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool IsWindow(IntPtr hWnd);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] private static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
    [DllImport("user32.dll")] private static extern bool ShowWindowAsync(IntPtr hWnd, int command);
    [DllImport("user32.dll")] private static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] private static extern bool BringWindowToTop(IntPtr hWnd);
    [DllImport("user32.dll")] private static extern bool SetWindowPos(IntPtr hWnd, IntPtr after, int x, int y, int cx, int cy, uint flags);
    [DllImport("user32.dll")] private static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
    [DllImport("user32.dll")] private static extern IntPtr MonitorFromWindow(IntPtr hWnd, uint flags);
    [DllImport("user32.dll", CharSet = CharSet.Auto)] private static extern bool GetMonitorInfo(IntPtr monitor, ref MONITORINFO info);
    [DllImport("user32.dll")] private static extern void keybd_event(byte key, byte scan, uint flags, UIntPtr extra);

    private static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    private static readonly IntPtr HWND_NOTOPMOST = new IntPtr(-2);
    private const uint SWP_NOSIZE = 0x0001;
    private const uint SWP_NOMOVE = 0x0002;
    private const uint SWP_SHOWWINDOW = 0x0040;

    public static IntPtr Find(string titlePart) {
        IntPtr found = IntPtr.Zero;
        EnumWindows(delegate(IntPtr hWnd, IntPtr unused) {
            if (!IsWindowVisible(hWnd)) return true;
            StringBuilder title = new StringBuilder(512);
            GetWindowText(hWnd, title, title.Capacity);
            if (title.ToString().IndexOf(titlePart, StringComparison.OrdinalIgnoreCase) >= 0) {
                found = hWnd;
                return false;
            }
            return true;
        }, IntPtr.Zero);
        return found;
    }

    public static void Raise(IntPtr hWnd) {
        ShowWindowAsync(hWnd, 9);
        SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
        SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
        BringWindowToTop(hWnd);
        SetForegroundWindow(hWnd);
    }

    public static bool IsFullscreen(IntPtr hWnd) {
        RECT window;
        if (!GetWindowRect(hWnd, out window)) return false;
        IntPtr monitor = MonitorFromWindow(hWnd, 2);
        MONITORINFO info = new MONITORINFO();
        info.cbSize = Marshal.SizeOf(typeof(MONITORINFO));
        if (!GetMonitorInfo(monitor, ref info)) return false;
        return Math.Abs(window.Left - info.rcMonitor.Left) <= 2
            && Math.Abs(window.Top - info.rcMonitor.Top) <= 2
            && Math.Abs(window.Right - info.rcMonitor.Right) <= 2
            && Math.Abs(window.Bottom - info.rcMonitor.Bottom) <= 2;
    }

    public static void PressF11() {
        keybd_event(0x7A, 0, 0, UIntPtr.Zero);
        keybd_event(0x7A, 0, 2, UIntPtr.Zero);
    }
}
"@

$chromeRoot = "${env:ProgramFiles(x86)}\Google\Chrome\Application"
$chromeProxy = Join-Path $chromeRoot "chrome_proxy.exe"
$chrome = Join-Path $chromeRoot "chrome.exe"
$appId = "emcpnaopahpcnanfngjfanjgffobkbhi"
$gameUrl = "https://haydenwatkins.github.io/Nobodys-Quest/"
$steamInputUri = "steam://forceinputappid/2171580777"

try {
    # Steam Input normally follows the foreground executable. Nobody's Quest
    # runs behind a persistent wrapper and an existing Chrome process, so use
    # Valve's supported per-app lock while the game is active.
    Start-Process $steamInputUri
    Start-Sleep -Milliseconds 250

    if (-not (Test-Path -LiteralPath $chromeProxy)) { throw "Google Chrome is not installed." }

    $window = [NobodyQuestWindow]::Find("Nobody's Quest")
    if ($window -eq [IntPtr]::Zero) {
        Start-Process -FilePath $chromeProxy -ArgumentList @(
            "--profile-directory=Default",
            "--app-id=$appId",
            "--start-fullscreen"
        )
    }

    $deadline = (Get-Date).AddSeconds(6)
    do {
        Start-Sleep -Milliseconds 200
        $window = [NobodyQuestWindow]::Find("Nobody's Quest")
    } while ($window -eq [IntPtr]::Zero -and (Get-Date) -lt $deadline)

    # If the installed-app registration ever disappears, the direct app URL
    # still gives Steam Link the same borderless experience.
    if ($window -eq [IntPtr]::Zero) {
        Start-Process -FilePath $chrome -ArgumentList @(
            "--profile-directory=Default",
            "--app=$gameUrl",
            "--start-fullscreen"
        )
        $deadline = (Get-Date).AddSeconds(10)
        do {
            Start-Sleep -Milliseconds 200
            $window = [NobodyQuestWindow]::Find("Nobody's Quest")
        } while ($window -eq [IntPtr]::Zero -and (Get-Date) -lt $deadline)
    }

    if ($window -eq [IntPtr]::Zero) { throw "Nobody's Quest did not open in Chrome." }

    [NobodyQuestWindow]::Raise($window)
    Start-Sleep -Milliseconds 700
    if (-not [NobodyQuestWindow]::IsFullscreen($window)) {
        [NobodyQuestWindow]::PressF11()
        Start-Sleep -Milliseconds 350
        [NobodyQuestWindow]::Raise($window)
    }

    # Keep Steam's non-Steam game alive until the game window is actually closed.
    while ([NobodyQuestWindow]::IsWindow($window)) {
        Start-Sleep -Milliseconds 500
    }
} finally {
    # Return Steam Link controllers directly to Big Picture navigation. This is
    # more reliable than foreground detection when Chrome remains open.
    Start-Process "steam://forceinputappid/769"
}

