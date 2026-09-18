import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

/**
 * Inso AI Native macOS Screen Capture
 * Ultra-fast framebuffer acquisition using CoreGraphics & ScreenCaptureKit
 */
@_cdecl("inso_apple_capture_display")
public func inso_apple_capture_display() -> UnsafeMutablePointer<CChar>? {
    let mainDisplayId = CGMainDisplayID()
    guard let imageRef = CGDisplayCreateImage(mainDisplayId) else {
        return nil
    }

    let width = CGImageGetWidth(imageRef)
    let height = CGImageGetHeight(imageRef)
    guard width > 0 && height > 0 else { return nil }

    // Compress to JPEG for high-speed agent vision
    let mutableData = CFDataCreateMutable(nil, 0)!
    guard let destination = CGImageDestinationCreateWithData(mutableData, UTType.jpeg.identifier as CFString, 1, nil) else {
        return nil
    }

    let options: [CFString: Any] = [
        kCGImageDestinationLossyCompressionQuality: 0.75
    ]
    CGImageDestinationAddImage(destination, imageRef, options as CFDictionary)
    guard CGImageDestinationFinalize(destination) else {
        return nil
    }

    let data = mutableData as Data
    let base64 = data.base64EncodedString()
    return strdup(base64)
}

@_cdecl("inso_apple_get_display_count")
public func inso_apple_get_display_count() -> Int32 {
    var displayCount: UInt32 = 0
    let maxDisplays: UInt32 = 16
    var activeDisplays = [CGDirectDisplayID](repeating: 0, count: Int(maxDisplays))
    let result = CGGetActiveDisplayList(maxDisplays, &activeDisplays, &displayCount)
    return result == .success ? Int32(displayCount) : 1
}
