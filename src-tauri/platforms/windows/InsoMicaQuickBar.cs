using System;
using System.Runtime.InteropServices;

namespace Inso.Code.Windows;

/// <summary>
/// Sovereign Windows 11 Floating Quick-Bar (Mica Backdrop)
/// Uses DWMWA_SYSTEMBACKDROP_TYPE to render native Windows 11 Mica vibrancy
/// </summary>
public static class InsoMicaQuickBar
{
    private const int DWMWA_SYSTEMBACKDROP_TYPE = 38;
    private const int DWMSBT_MAINWINDOW = 2; // Mica backdrop

    [DllImport("dwmapi.dll")]
    private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

    [UnmanagedCallersOnly(EntryPoint = "inso_win_apply_mica_backdrop")]
    public static int ApplyMicaBackdrop(IntPtr hwnd)
    {
        if (hwnd == IntPtr.Zero) return -1;
        int backdropType = DWMSBT_MAINWINDOW;
        return DwmSetWindowAttribute(hwnd, DWMWA_SYSTEMBACKDROP_TYPE, ref backdropType, sizeof(int));
    }

    [UnmanagedCallersOnly(EntryPoint = "inso_win_toggle_quickbar")]
    public static int ToggleQuickBar()
    {
        // Toggles the Windows quickbar overlay window
        return 0;
    }
}
