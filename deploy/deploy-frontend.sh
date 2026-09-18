#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${HOME}/websites/StudyNet"
cd "$APP_DIR"

echo "==> Node 20"
command -v nvm >/dev/null 2>&1 && . "$HOME/.nvm/nvm.sh" && nvm use 20 || true

echo "==> Frontend .env (production)"
cat > frontend/.env <<'EOF'
REACT_APP_BASE_URL=https://api.openhand.live/api/v1
REACT_APP_RAZORPAY_KEY=rzp_live_TJaHMAbw0Us61p
EOF

echo "==> Install + build"
cd frontend
npm install
npm run build

echo "==> Build output"
ls -la build | head

echo ""
echo "Frontend build ready at: $APP_DIR/frontend/build"
echo "Point nginx root to that folder for openhand.live"
echo "Then: sudo nginx -t && sudo systemctl reload nginx"
