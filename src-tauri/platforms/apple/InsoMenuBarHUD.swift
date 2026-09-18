import Foundation
import AppKit

/**
 * Inso AI Native macOS Menu Bar (NSStatusItem) & Spotlight HUD Companion
 */

public class InsoStatusBarManager: NSObject {
    public static let shared = InsoStatusBarManager()
    private var statusItem: NSStatusItem?

    public func setup(title: String) {
        DispatchQueue.main.async {
            if self.statusItem == nil {
                self.statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
            }
            if let button = self.statusItem?.button {
                button.title = "⚡ " + title
            }
            
            let menu = NSMenu()
            menu.addItem(NSMenuItem(title: "Inso AI Sovereign HUD", action: nil, keyEquivalent: ""))
            menu.addItem(NSMenuItem.separator())
            menu.addItem(NSMenuItem(title: "Mode: Sovereign Active", action: nil, keyEquivalent: ""))
            menu.addItem(NSMenuItem(title: "Hardware: Apple Silicon ANE", action: nil, keyEquivalent: ""))
            menu.addItem(NSMenuItem.separator())
            menu.addItem(NSMenuItem(title: "Quit Inso AI", action: #selector(self.quitApp), keyEquivalent: "q"))
            
            self.statusItem?.menu = menu
        }
    }

    public func update(status: String) {
        DispatchQueue.main.async {
            if let button = self.statusItem?.button {
                button.title = "⚡ Inso: " + status
            }
        }
    }

    @objc private func quitApp() {
        NSApplication.shared.terminate(nil)
    }
}

@_cdecl("inso_apple_setup_menu_bar")
public func inso_apple_setup_menu_bar(titlePtr: UnsafePointer<CChar>) -> Int32 {
    let title = String(cString: titlePtr)
    InsoStatusBarManager.shared.setup(title: title)
    return 0
}

@_cdecl("inso_apple_update_menu_bar")
public func inso_apple_update_menu_bar(statusPtr: UnsafePointer<CChar>) -> Int32 {
    let status = String(cString: statusPtr)
    InsoStatusBarManager.shared.update(status: status)
    return 0
}
