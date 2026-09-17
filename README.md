# 🖥️ Inso.Code.Desktop — Bare-Metal OS Bridge & Desktop Enclave

> The native desktop runtime for **Inso Agent** — The World's #1 Desktop AI Agent.
> Powered by **Tauri v2 + Rust** for sub-millisecond, bare-metal operating system control and perception.

[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-blue)]()
[![Rust](https://img.shields.io/badge/rust-v1.75%2B-orange)](https://www.rust-lang.org)
[![Tauri](https://img.shields.io/badge/tauri-v2-purple)](https://v2.tauri.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ℹ️ Overview

`Inso.Code.Desktop` is the local native desktop enclave that gives Inso Agent physical, human-like computer use capabilities. It connects sovereign cloud cognitive models (microsoft Azure OpenAI Azure GPT-6 Astra 3.7 Extended Thinking & Azure GPT-6 Astra 3.5 Sonnet Computer Use) directly to bare-metal operating system controls with zero third-party telemetry.

---

## ⚡ Bare-Metal OS Primitives (`src-tauri/src/main.rs`)

### 1. Hardware Mouse Injection
- `inject_mouse_move(x, y)`: Sub-pixel mouse positioning calibrated to Retina display scales.
- `inject_mouse_click(x, y, button)`: Left, right, and middle clicks.
- `inject_mouse_double_click(x, y)` & `inject_mouse_triple_click(x, y)`: Word, line, and spreadsheet cell selection.
- `inject_mouse_drag(start_x, start_y, end_x, end_y)`: Native drag-and-drop file and window management.
- `inject_mouse_scroll(dx, dy)`: High-precision wheel scrolling.
- `inject_mouse_down(button)` & `inject_mouse_up(button)`: Press-and-hold interactions.

### 2. Physical Keyboard & Hotkey Orchestration
- `inject_keyboard_type(text)`: Keystroke streaming at human-like typing cadence.
- `inject_keyboard_key(key)`: Single key events (Return, Tab, Escape, Backspace, arrows).
- `inject_hotkey_combination(modifiers, key)`: OS-level shortcut chords (`Cmd`, `Ctrl`, `Alt`, `Shift`).

### 3. Native Clipboard Operations
- `read_clipboard_native()`: Direct zero-dependency OS clipboard extraction (`pbpaste` on macOS, PowerShell on Windows).
- `write_clipboard_native(text)`: Instant clipboard injection (`pbcopy` on macOS, PowerShell on Windows) for 1-click Excel/Keynote exports.

### 4. Display Perception & OS Introspection
- `capture_screen_native()`: Low-latency desktop display buffer capture.
- `capture_screen_region(x, y, width, height)`: Cropped coordinate snapshot for targeted UI element verification.
- `capture_window_native()`: Window-isolated capture for active applications.
- `get_screen_geometry()`: Real-time monitor bounds and Retina scale factor calibration.
- `focus_application_window(app_name)`: Programmatic OS window switching between IDEs, browsers, terminals, and spreadsheets.
- `get_system_running_processes()`: Live OS process tree enumeration.
- `inspect_accessibility_tree()`: UI accessibility tree inspection for semantic element labels.

---

## 🔒 Security & Air-Gapped Enclave

- **Zero Public Cloud Egress**: Only communicates with Azure sovereign private endpoints.
- **Human Approval Gate (Law 23)**: Consequential system commands require explicit operator authorization.
- **Global Emergency Abort**: Pressing `Escape` at any time instantly halts all pending OS mouse and keyboard action queues.

---

## 🛠️ Build & Run

```bash
# Check Rust backend
cargo check --manifest-path src-tauri/Cargo.toml

# Run desktop app in development
npm run tauri dev

# Build production installer
npm run tauri build
```

---

## License

MIT © 2024–2026 Inso.Code
