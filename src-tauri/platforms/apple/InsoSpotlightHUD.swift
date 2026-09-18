import Foundation
import AppKit

/**
 * Inso AI Native macOS Floating Spotlight HUD (Liquid Glass)
 * Borderless, floating companion panel with NSVisualEffectView vibrancy
 */

public class InsoSpotlightPanel: NSPanel {
    public init(contentRect: NSRect) {
        super.init(
            contentRect: contentRect,
            styleMask: [.nonactivatingPanel, .fullSizeContentView, .borderless],
            backing: .buffered,
            defer: false
        )
        self.isFloatingPanel = true
        self.level = .floating
        self.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        self.titleVisibility = .hidden
        self.titlebarAppearsTransparent = true
        self.isOpaque = false
        self.backgroundColor = .clear
        self.hasShadow = true

        // Liquid Glass Visual Effect Backdrop
        let visualEffect = NSVisualEffectView(frame: contentRect)
        visualEffect.material = .hudWindow
        visualEffect.blendingMode = .behindWindow
        visualEffect.state = .active
        visualEffect.wantsLayer = true
        visualEffect.layer?.cornerRadius = 18.0
        visualEffect.layer?.masksToBounds = true
        visualEffect.layer?.borderWidth = 1.0
        visualEffect.layer?.borderColor = NSColor.white.withAlphaComponent(0.15).cgColor

        self.contentView = visualEffect
    }
}

public class InsoSpotlightHUDController: NSObject {
    public static let shared = InsoSpotlightHUDController()
    private var panel: InsoSpotlightPanel?

    public func toggle() -> Bool {
        DispatchQueue.main.async {
            if self.panel == nil {
                let screenRect = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
                let panelWidth: CGFloat = 680
                let panelHeight: CGFloat = 380
                let panelRect = NSRect(
                    x: screenRect.midX - (panelWidth / 2.0),
                    y: screenRect.maxY - panelHeight - 120,
                    width: panelWidth,
                    height: panelHeight
                )
                self.panel = InsoSpotlightPanel(contentRect: panelRect)
            }

            guard let panel = self.panel else { return }

            if panel.isVisible {
                panel.orderOut(nil)
            } else {
                panel.makeKeyAndOrderFront(nil)
                NSApp.activate(ignoringOtherApps: true)
            }
        }
        return true
    }

    public func isVisible() -> Bool {
        return self.panel?.isVisible ?? false
    }
}

@_cdecl("inso_apple_toggle_spotlight_hud")
public func inso_apple_toggle_spotlight_hud() -> Int32 {
    let _ = InsoSpotlightHUDController.shared.toggle()
    return 0
}

@_cdecl("inso_apple_is_spotlight_hud_visible")
public func inso_apple_is_spotlight_hud_visible() -> Bool {
    return InsoSpotlightHUDController.shared.isVisible()
}
