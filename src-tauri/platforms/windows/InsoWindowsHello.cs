using System;
using System.Runtime.InteropServices;
using System.Threading.Tasks;
using Windows.Security.Credentials.UI;

namespace Inso.Code.Windows;

/// <summary>
/// Sovereign Windows Hello Biometrics Gate
/// Uses Windows.Security.Credentials.UI.UserConsentVerifier for Touch / Face / PIN authentication
/// </summary>
public static class InsoWindowsHello
{
    [UnmanagedCallersOnly(EntryPoint = "inso_win_authenticate_biometrics")]
    public static int AuthenticateBiometrics(IntPtr reasonPtr)
    {
        try
        {
            string reason = Marshal.PtrToStringUTF8(reasonPtr) ?? "Inso AI Sovereign Hardware Verification";
            var task = Task.Run(async () =>
            {
                var availability = await UserConsentVerifier.CheckAvailabilityAsync();
                if (availability != UserConsentVerifierAvailability.Available)
                {
                    return 0; // Biometrics not configured
                }
                var result = await UserConsentVerifier.RequestVerificationAsync(reason);
                return result == UserConsentVerificationResult.Verified ? 1 : 0;
            });

            return task.GetAwaiter().GetResult();
        }
        catch
        {
            return 0;
        }
    }

    [UnmanagedCallersOnly(EntryPoint = "inso_win_has_biometrics")]
    public static int HasBiometrics()
    {
        try
        {
            var task = Task.Run(async () =>
            {
                var availability = await UserConsentVerifier.CheckAvailabilityAsync();
                return availability == UserConsentVerifierAvailability.Available ? 1 : 0;
            });
            return task.GetAwaiter().GetResult();
        }
        catch
        {
            return 0;
        }
    }
}
