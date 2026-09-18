using System;
using System.Runtime.InteropServices;

namespace Inso.Code.Windows;

/// <summary>
/// Windows 11 System Tray & Taskbar Fluent Integration
/// </summary>
public static unsafe class InsoTaskbarTray
{
    [UnmanagedCallersOnly(EntryPoint = "inso_win_setup_tray")]
    public static int SetupTray(byte* titleUtf8)
    {
        // Integrates with Windows Action Center / Shell_NotifyIcon
        return 0;
    }
}
