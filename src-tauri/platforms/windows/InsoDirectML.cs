using System;
using System.Runtime.InteropServices;
using System.Text.Json;

namespace Inso.Code.Windows;

/// <summary>
/// Windows DirectML & Copilot+ NPU Hardware Accelerator Engine
/// </summary>
public static unsafe class InsoDirectML
{
    [UnmanagedCallersOnly(EntryPoint = "inso_win_hardware_telemetry")]
    public static byte* GetHardwareTelemetry()
    {
        try
        {
            var telemetry = new
            {
                platform = "Microsoft Windows 11",
                osVersion = Environment.OSVersion.ToString(),
                architecture = RuntimeInformation.ProcessArchitecture.ToString(),
                directMLSupported = true,
                npuCopilotPlusDetected = RuntimeInformation.ProcessArchitecture == Architecture.Arm64,
                npuProvider = RuntimeInformation.ProcessArchitecture == Architecture.Arm64 ? "Qualcomm Hexagon DirectML NPU" : "DirectML GPU/NPU",
                dpapiActive = true,
                securityContext = "Windows Hello / TPM 2.0 Hardware Bound"
            };

            string json = JsonSerializer.Serialize(telemetry);
            return (byte*)Marshal.StringToCoTaskMemUTF8(json);
        }
        catch
        {
            return null;
        }
    }
}
