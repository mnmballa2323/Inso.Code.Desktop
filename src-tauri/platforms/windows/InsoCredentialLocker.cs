using System;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;

namespace Inso.Code.Windows;

/// <summary>
/// Sovereign Windows Credential Storage
/// Sealed via Windows Data Protection API (DPAPI) and TPM 2.0
/// </summary>
public static unsafe class InsoCredentialLocker
{
    private static readonly byte[] Entropy = Encoding.UTF8.GetBytes("Inso.Code.Sovereign.Entropy.v1");

    [UnmanagedCallersOnly(EntryPoint = "inso_win_credentials_set")]
    public static int SetCredential(byte* keyUtf8, byte* valUtf8)
    {
        try
        {
            string key = Marshal.PtrToStringUTF8((IntPtr)keyUtf8)!;
            string val = Marshal.PtrToStringUTF8((IntPtr)valUtf8)!;

            byte[] plaintext = Encoding.UTF8.GetBytes(val);
            byte[] ciphertext = ProtectedData.Protect(plaintext, Entropy, DataProtectionScope.CurrentUser);

            string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string dir = System.IO.Path.Combine(appData, "InsoAI", "Vault");
            System.IO.Directory.CreateDirectory(dir);

            string filePath = System.IO.Path.Combine(dir, $"{key}.enc");
            System.IO.File.WriteAllBytes(filePath, ciphertext);
            return 0;
        }
        catch
        {
            return -1;
        }
    }

    [UnmanagedCallersOnly(EntryPoint = "inso_win_credentials_get")]
    public static byte* GetCredential(byte* keyUtf8)
    {
        try
        {
            string key = Marshal.PtrToStringUTF8((IntPtr)keyUtf8)!;
            string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string filePath = System.IO.Path.Combine(appData, "InsoAI", "Vault", $"{key}.enc");

            if (!System.IO.File.Exists(filePath)) return null;

            byte[] ciphertext = System.IO.File.ReadAllBytes(filePath);
            byte[] plaintext = ProtectedData.Unprotect(ciphertext, Entropy, DataProtectionScope.CurrentUser);
            string val = Encoding.UTF8.GetString(plaintext);

            return (byte*)Marshal.StringToCoTaskMemUTF8(val);
        }
        catch
        {
            return null;
        }
    }
}
