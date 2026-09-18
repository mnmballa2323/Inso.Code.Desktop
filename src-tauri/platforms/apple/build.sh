#!/bin/bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

mkdir -p .swift-cache

echo "🍎 [Swift Build] Compiling Inso Apple Native Subsystem..."
swiftc -O \
  -emit-library \
  -static \
  -module-name InsoAppleBridge \
  -module-cache-path ./.swift-cache \
  InsoKeychain.swift \
  InsoScreenCapture.swift \
  InsoAccessibility.swift \
  InsoNeuralEngine.swift \
  InsoMenuBarHUD.swift \
  -o libinso_apple.a

echo "✅ [Swift Build] Successfully compiled libinso_apple.a"
