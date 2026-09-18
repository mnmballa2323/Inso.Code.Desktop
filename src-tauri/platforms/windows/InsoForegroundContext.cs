using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace Inso.Code.Windows;

/// <summary>
/// Sovereign Windows 11 Foreground & Active Window Context
/// Detects frontmost IDE, terminal, active window title, and process metadata
/// </summary>
public static class InsoForegroundContext
{
    [DllImport("user32.dll")]
    private static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    private static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [UnmanagedCallersOnly(EntryPoint = "inso_win_get_foreground_context")]
    public static IntPtr GetForegroundContext()
    {
        try
        {
            IntPtr hwnd = GetForegroundWindow();
            if (hwnd == IntPtr.Zero) return IntPtr.Zero;

            var titleBuilder = new StringBuilder(512);
            GetWindowText(hwnd, titleBuilder, titleBuilder.Capacity);
            string windowTitle = titleBuilder.ToString();

            GetWindowThreadProcessId(hwnd, out uint pid);
            string processName = "Unknown";
            try
            {
                using var proc = Process.GetProcessById((int)pid);
                processName = proc.ProcessName;
            }
            catch { }

            string nameLower = processName.ToLowerInvariant();
            bool isDevTool = nameLower.Contains("code") ||
                             nameLower.Contains("devenv") ||
                             nameLower.Contains("cursor") ||
                             nameLower.Contains("windowsterminal") ||
                             nameLower.Contains("cmd") ||
                             nameLower.Contains("powershell") ||
                             nameLower.Contains("rider") ||
                             nameLower.Contains("idea64");

            var payload = new
            {
                frontmostApp = processName,
                processId = pid,
                windowTitle = windowTitle,
                isDeveloperTool = isDevTool,
                timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };

            string json = JsonSerializer.Serialize(payload);
            byte[] utf8Bytes = Encoding.UTF8.GetBytes(json + "\0");
            IntPtr unmanagedMem = Marshal.AllocHGlobal(utf8Bytes.Length);
            Marshal.Copy(utf8Bytes, 0, unmanagedMem, utf8Bytes.Length);
            return unmanagedMem;
        }
        catch
        {
            return IntPtr.Zero;
        }
    }
}
