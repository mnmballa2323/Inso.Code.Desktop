import Foundation
import AppKit
import CoreGraphics

/**
 * Inso AI Native macOS Workspace & Window Context Introspection
 * Extracts frontmost application, active document title, and developer environment
 */

@_cdecl("inso_apple_get_frontmost_context")
public func inso_apple_get_frontmost_context() -> UnsafeMutablePointer<CChar>? {
    let workspace = NSWorkspace.shared
    guard let frontApp = workspace.frontmostApplication else {
        return nil
    }

    let appName = frontApp.localizedName ?? "Unknown"
    let bundleId = frontApp.bundleIdentifier ?? ""
    let pid = frontApp.processIdentifier

    var windowTitle = ""
    let windowListInfo = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as? [[String: Any]] ?? []

    for windowInfo in windowListInfo {
        if let ownerPID = windowInfo[kCGWindowOwnerPID as String] as? pid_t, ownerPID == pid {
            if let name = windowInfo[kCGWindowName as String] as? String, !name.isEmpty {
                windowTitle = name
                break
            }
        }
    }

    let isDeveloperTool: Bool = {
        let nameLower = appName.lowercased()
        return nameLower.contains("code") ||
               nameLower.contains("xcode") ||
               nameLower.contains("cursor") ||
               nameLower.contains("terminal") ||
               nameLower.contains("iterm") ||
               nameLower.contains("ghostty") ||
               nameLower.contains("warp") ||
               nameLower.contains("zed") ||
               nameLower.contains("intellij") ||
               nameLower.contains("pycharm")
    }()

    let contextDict: [String: Any] = [
        "frontmostApp": appName,
        "bundleIdentifier": bundleId,
        "processId": pid,
        "windowTitle": windowTitle,
        "isDeveloperTool": isDeveloperTool,
        "timestamp": Date().timeIntervalSince1970
    ]

    guard let jsonData = try? JSONSerialization.data(withJSONObject: contextDict, options: []),
          let jsonString = String(data: jsonData, encoding: .utf8) else {
        return nil
    }

    return strdup(jsonString)
}
