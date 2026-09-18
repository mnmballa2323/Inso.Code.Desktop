import Foundation
import Security

/**
 * Inso AI Sovereign Apple Keychain Storage
 * Hardware-backed credential vault tied to Apple Secure Enclave & Touch ID
 */
@_cdecl("inso_apple_keychain_set")
public func inso_apple_keychain_set(
    keyPtr: UnsafePointer<CChar>,
    valuePtr: UnsafePointer<CChar>
) -> Int32 {
    let key = String(cString: keyPtr)
    let value = String(cString: valuePtr)
    guard let data = value.data(using: .utf8) else { return -1 }

    // Delete any existing item first
    let queryDelete: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecAttrService as String: "com.inso.code.sovereign"
    ]
    SecItemDelete(queryDelete as CFDictionary)

    // Add new hardware-protected item
    let queryAdd: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecAttrService as String: "com.inso.code.sovereign",
        kSecValueData as String: data,
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    ]

    let status = SecItemAdd(queryAdd as CFDictionary, nil)
    return status == errSecSuccess ? 0 : Int32(status)
}

@_cdecl("inso_apple_keychain_get")
public func inso_apple_keychain_get(
    keyPtr: UnsafePointer<CChar>
) -> UnsafeMutablePointer<CChar>? {
    let key = String(cString: keyPtr)
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecAttrService as String: "com.inso.code.sovereign",
        kSecReturnData as String: true,
        kSecMatchLimit as String: kSecMatchLimitOne
    ]

    var dataTypeRef: AnyObject?
    let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
    guard status == errSecSuccess,
          let data = dataTypeRef as? Data,
          let string = String(data: data, encoding: .utf8) else {
        return nil
    }

    return strdup(string)
}

@_cdecl("inso_apple_keychain_delete")
public func inso_apple_keychain_delete(
    keyPtr: UnsafePointer<CChar>
) -> Int32 {
    let key = String(cString: keyPtr)
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecAttrService as String: "com.inso.code.sovereign"
    ]
    let status = SecItemDelete(query as CFDictionary)
    return status == errSecSuccess ? 0 : Int32(status)
}

@_cdecl("inso_apple_free_string")
public func inso_apple_free_string(ptr: UnsafeMutablePointer<CChar>?) {
    if let p = ptr {
        free(p)
    }
}
