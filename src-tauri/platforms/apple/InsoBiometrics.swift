import Foundation
import LocalAuthentication

/**
 * Inso AI Native macOS Biometric Gate
 * Hardware-backed Touch ID & LocalAuthentication for sovereign actions
 */

@_cdecl("inso_apple_authenticate_biometrics")
public func inso_apple_authenticate_biometrics(reasonPtr: UnsafePointer<CChar>) -> Bool {
    let reason = String(cString: reasonPtr)
    let context = LAContext()
    var error: NSError?

    // Check if biometric authentication is available on this hardware
    guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
        // If biometrics not enrolled, check device passcode fallback
        if context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) {
            var authSuccess = false
            let semaphore = DispatchSemaphore(value: 0)
            context.evaluatePolicy(.deviceOwnerAuthentication, localizedReason: reason) { success, _ in
                authSuccess = success
                semaphore.signal()
            }
            semaphore.wait()
            return authSuccess
        }
        return false
    }

    var authSuccess = false
    let semaphore = DispatchSemaphore(value: 0)
    context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: reason) { success, _ in
        authSuccess = success
        semaphore.signal()
    }
    semaphore.wait()
    return authSuccess
}

@_cdecl("inso_apple_has_biometrics")
public func inso_apple_has_biometrics() -> Bool {
    let context = LAContext()
    var error: NSError?
    return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
}
