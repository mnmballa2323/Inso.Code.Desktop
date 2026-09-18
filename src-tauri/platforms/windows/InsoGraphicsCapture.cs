using System;
using System.Runtime.InteropServices;

namespace Inso.Code.Windows;

/// <summary>
/// Windows.Graphics.Capture API Bridge for Low-Latency Screen Vision
/// </summary>
public static unsafe class InsoGraphicsCapture
{
    [UnmanagedCallersOnly(EntryPoint = "inso_win_is_capture_supported")]
    public static int IsCaptureSupported()
    {
        // Supported on Windows 10 build 1803+ / Windows 11
        return Environment.OSVersion.Version.Build >= 17134 ? 1 : 0;
    }
}
