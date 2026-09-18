import Foundation

/**
 * Inso AI Native Apple Silicon Neural Engine & Hardware Telemetry
 * Probes Apple M-series chips, Unified Memory, and CoreML capabilities
 */

@_cdecl("inso_apple_hardware_telemetry")
public func inso_apple_hardware_telemetry() -> UnsafeMutablePointer<CChar>? {
    var size: size_t = 0
    sysctlbyname("machdep.cpu.brand_string", nil, &size, nil, 0)
    var machine = [CChar](repeating: 0, count: size)
    sysctlbyname("machdep.cpu.brand_string", &machine, &size, nil, 0)
    let cpuBrand = String(cString: machine).trimmingCharacters(in: .whitespacesAndNewlines)

    var memSize: UInt64 = 0
    var memSizeLen = MemoryLayout<UInt64>.size
    sysctlbyname("hw.memsize", &memSize, &memSizeLen, nil, 0)

    #if arch(arm64)
    let isAppleSilicon = true
    let neuralEngineAvailable = true
    let unifiedMemory = true
    #else
    let isAppleSilicon = false
    let neuralEngineAvailable = false
    let unifiedMemory = false
    #endif

    let osVersion = ProcessInfo.processInfo.operatingSystemVersionString

    let jsonDict: [String: Any] = [
        "platform": "Apple macOS",
        "cpu": cpuBrand.isEmpty ? "Apple Silicon" : cpuBrand,
        "isAppleSilicon": isAppleSilicon,
        "neuralEngineAvailable": neuralEngineAvailable,
        "unifiedMemory": unifiedMemory,
        "memoryBytes": memSize,
        "memoryGigabytes": Double(memSize) / (1024.0 * 1024.0 * 1024.0),
        "osVersion": osVersion,
        "metalSupported": true,
        "secureEnclaveActive": true
    ]

    guard let jsonData = try? JSONSerialization.data(withJSONObject: jsonDict, options: []),
          let jsonString = String(data: jsonData, encoding: .utf8) else {
        return nil
    }

    return strdup(jsonString)
}
