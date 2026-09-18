#!/usr/bin/env bash
# start-dev.sh — Inso Code Desktop Launcher
# Starts Backend, Next.js, waits for them to be ready, pre-warms routes, then launches Tauri.

set -e

export PATH="$HOME/.cargo/bin:$PATH"

NEXT_DIR="../Inso.Code.Frontend"
BACKEND_DIR="../Inso.Code.Backend"
PORT=3000
BACKEND_PORT=5001

STARTED_BACKEND_PID=""
STARTED_NEXT_PID=""

cleanup() {
  if [ -n "$STARTED_NEXT_PID" ]; then
    kill "$STARTED_NEXT_PID" 2>/dev/null || true
  fi
  if [ -n "$STARTED_BACKEND_PID" ]; then
    kill "$STARTED_BACKEND_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# ── 1. Check or Start Sovereign Backend ──────────────────────────────────────
if curl -s --max-time 2 "http://localhost:$BACKEND_PORT/healthz" > /dev/null 2>&1; then
  echo "✅ [Inso Dev] Sovereign Backend is already running on port $BACKEND_PORT"
else
  echo "🚀 [Inso Dev] Starting Sovereign Backend on port $BACKEND_PORT..."
  cd "$BACKEND_DIR"
  PORT=$BACKEND_PORT npm start &
  STARTED_BACKEND_PID=$!
  cd - > /dev/null

  echo "⏳ [Inso Dev] Waiting for Backend to respond..."
  MAX_WAIT_BACKEND=25
  WAITED_BACKEND=0
  while [ $WAITED_BACKEND -lt $MAX_WAIT_BACKEND ]; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "http://localhost:$BACKEND_PORT/healthz" 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "503" ]; then
      echo "✅ [Inso Dev] Backend ready (status: $STATUS)"
      break
    fi
    sleep 1
    WAITED_BACKEND=$((WAITED_BACKEND + 1))
  done
fi

# ── 2. Check or Start Next.js Frontend ───────────────────────────────────────
if nc -z 127.0.0.1 $PORT 2>/dev/null; then
  echo "✅ [Inso Dev] Next.js frontend is already active on port $PORT"
else
  echo "🚀 [Inso Dev] Starting Next.js on port $PORT..."
  cd "$NEXT_DIR"
  NEXT_PUBLIC_API_URL="http://localhost:$BACKEND_PORT/api/v1" NEXTAUTH_URL="http://127.0.0.1:$PORT" npx next dev -H 127.0.0.1 -p $PORT &
  STARTED_NEXT_PID=$!
  cd - > /dev/null

  echo "⏳ [Inso Dev] Waiting for Next.js to be ready..."
  MAX_WAIT=60
  WAITED=0
  while [ $WAITED -lt $MAX_WAIT ]; do
    if nc -z 127.0.0.1 $PORT 2>/dev/null; then
      echo "✅ [Inso Dev] Next.js server ready on port $PORT"
      break
    fi
    sleep 1
    WAITED=$((WAITED + 1))
  done
fi

# ── 3. Pre-warm /code Route ──────────────────────────────────────────────────
echo "🔥 [Inso Dev] Verifying /code route response..."
curl -s -L --max-time 15 "http://127.0.0.1:$PORT/code" > /dev/null || true
echo "✅ [Inso Dev] Core routes verified"

# ── Launch Tauri ──────────────────────────────────────────────────────────────
echo "🖥️  [Inso Dev] Launching Tauri desktop app..."
npm run tauri dev

