import Foundation
import Metal

/**
 * Inso AI Native macOS Metal & Thermal Subsystem
 * Deep hardware inspection of Apple Silicon GPU, Unified Memory architecture, and thermals
 */

@_cdecl("inso_apple_deep_telemetry")
public func inso_apple_deep_telemetry() -> UnsafeMutablePointer<CChar>? {
    var gpuName = "Apple GPU"
    var hasUnifiedMemory = false
    var maxBufferLength: UInt64 = 0
    var registryID: UInt64 = 0

    if let device = MTLCreateSystemDefaultDevice() {
        gpuName = device.name
        hasUnifiedMemory = device.hasUnifiedMemory
        maxBufferLength = UInt64(device.maxBufferLength)
        registryID = device.registryID
    }

    let thermalStateString: String = {
        switch ProcessInfo.processInfo.thermalState {
        case .nominal: return "Nominal (Cool)"
        case .fair: return "Fair (Optimal)"
        case .serious: return "Serious (Throttling Warm)"
        case .critical: return "Critical (Throttling High)"
        @unknown default: return "Nominal"
        }
    }()

    let isLowPowerMode = ProcessInfo.processInfo.isLowPowerModeEnabled

    let telemetryDict: [String: Any] = [
        "gpuName": gpuName,
        "hasUnifiedMemory": hasUnifiedMemory,
        "maxBufferGigabytes": Double(maxBufferLength) / (1024.0 * 1024.0 * 1024.0),
        "registryID": registryID,
        "thermalState": thermalStateString,
        "isLowPowerMode": isLowPowerMode,
        "metalFeatureSet": "Metal 3 Native Architecture",
        "activeProcessors": ProcessInfo.processInfo.activeProcessorCount
    ]

    guard let jsonData = try? JSONSerialization.data(withJSONObject: telemetryDict, options: []),
          let jsonString = String(data: jsonData, encoding: .utf8) else {
        return nil
    }

    return strdup(jsonString)
}
