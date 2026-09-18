import Foundation
import CoreGraphics
import ApplicationServices

/**
 * Inso AI Native macOS Accessibility & Computer Use Engine
 * Zero-latency hardware event simulation via CoreGraphics CGEvent & AXUIElement
 */

@_cdecl("inso_apple_check_accessibility_permission")
public func inso_apple_check_accessibility_permission() -> Bool {
    return AXIsProcessTrusted()
}

@_cdecl("inso_apple_mouse_move")
public func inso_apple_mouse_move(x: Double, y: Double) -> Int32 {
    let point = CGPoint(x: x, y: y)
    guard let event = CGEvent(mouseEventSource: nil, mouseType: .mouseMoved, mouseCursorPosition: point, mouseButton: .left) else {
        return -1
    }
    event.post(tap: .cghidEventTap)
    return 0
}

@_cdecl("inso_apple_mouse_click")
public func inso_apple_mouse_click(x: Double, y: Double, button: Int32) -> Int32 {
    let point = CGPoint(x: x, y: y)
    let isRight = button == 1
    let downType: CGEventType = isRight ? .rightMouseDown : .leftMouseDown
    let upType: CGEventType = isRight ? .rightMouseUp : .leftMouseUp
    let mouseButton: CGMouseButton = isRight ? .right : .left

    guard let downEvent = CGEvent(mouseEventSource: nil, mouseType: downType, mouseCursorPosition: point, mouseButton: mouseButton),
          let upEvent = CGEvent(mouseEventSource: nil, mouseType: upType, mouseCursorPosition: point, mouseButton: mouseButton) else {
        return -1
    }

    downEvent.post(tap: .cghidEventTap)
    usleep(25_000) // 25ms natural click interval
    upEvent.post(tap: .cghidEventTap)
    return 0
}

@_cdecl("inso_apple_type_text")
public func inso_apple_type_text(textPtr: UnsafePointer<CChar>) -> Int32 {
    let text = String(cString: textPtr)
    for char in text {
        let utf16Chars = Array(String(char).utf16)
        guard let downEvent = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: true),
              let upEvent = CGEvent(keyboardEventSource: nil, virtualKey: 0, keyDown: false) else {
            continue
        }
        downEvent.keyboardSetUnicodeString(stringLength: utf16Chars.count, unicodeString: utf16Chars)
        upEvent.keyboardSetUnicodeString(stringLength: utf16Chars.count, unicodeString: utf16Chars)
        
        downEvent.post(tap: .cghidEventTap)
        usleep(10_000) // 10ms typing delay
        upEvent.post(tap: .cghidEventTap)
    }
    return 0
}

@_cdecl("inso_apple_key_press")
public func inso_apple_key_press(virtualKey: UInt16, flags: UInt64) -> Int32 {
    guard let downEvent = CGEvent(keyboardEventSource: nil, virtualKey: virtualKey, keyDown: true),
          let upEvent = CGEvent(keyboardEventSource: nil, virtualKey: virtualKey, keyDown: false) else {
        return -1
    }
    if flags > 0 {
        downEvent.flags = CGEventFlags(rawValue: flags)
        upEvent.flags = CGEventFlags(rawValue: flags)
    }
    downEvent.post(tap: .cghidEventTap)
    usleep(15_000)
    upEvent.post(tap: .cghidEventTap)
    return 0
}
