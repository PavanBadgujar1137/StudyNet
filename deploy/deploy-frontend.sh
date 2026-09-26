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
REACT_APP_GOOGLE_CLIENT_ID=647617986680-8s8q5496eu6hvmmhmck5qroaqbppgdti.apps.googleusercontent.com
REACT_APP_LINKEDIN_CLIENT_ID=77fou7zrz4jm4o
REACT_APP_PLATFORM_DOMAIN=openhand.live
REACT_APP_CLOUDFRONT_DOMAIN=d2ruooz1ktuxdd.cloudfront.net
REACT_APP_ENABLE_SOCIAL_DISPATCH=true
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
