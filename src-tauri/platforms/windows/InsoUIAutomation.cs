using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace Inso.Code.Windows;

/// <summary>
/// Windows UI Automation Client for Zero-Hallucination OS Agent Computer Use
/// </summary>
public static unsafe class InsoUIAutomation
{
    [DllImport("user32.dll")]
    private static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    private static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);

    private const uint MOUSEEVENTF_LEFTDOWN = 0x0002;
    private const uint MOUSEEVENTF_LEFTUP = 0x0004;
    private const uint MOUSEEVENTF_RIGHTDOWN = 0x0008;
    private const uint MOUSEEVENTF_RIGHTUP = 0x0010;

    [UnmanagedCallersOnly(EntryPoint = "inso_win_mouse_click")]
    public static int MouseClick(double x, double y, int button)
    {
        try
        {
            SetCursorPos((int)x, (int)y);
            Thread.Sleep(20);

            if (button == 1) // Right click
            {
                mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0);
                Thread.Sleep(25);
                mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0);
            }
            else
            {
                mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                Thread.Sleep(25);
                mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
            }
            return 0;
        }
        catch
        {
            return -1;
        }
    }
}
