#!/usr/bin/env bash
# Deploy OpenHand backend to production server
# Usage: ./deploy/deploy-backend.sh
# Run on the EC2 server:
#   cd ~/StudyNet && git pull && bash deploy/deploy-backend.sh

set -euo pipefail

APP_DIR="${HOME}/StudyNet"
cd "$APP_DIR/backend"

echo "==> Node version"
command -v nvm >/dev/null 2>&1 && . "$HOME/.nvm/nvm.sh" && nvm use 20 || true
node -v

echo "==> Install dependencies"
npm install --production

echo "==> Restarting PM2 processes"
# Restart production app (PORT 6000)
pm2 restart openhand-api || pm2 start ecosystem.config.cjs --only openhand-api
# Optionally also restart UAT (PORT 4000)
# pm2 restart openhand-api-uat || pm2 start ecosystem.config.cjs --only openhand-api-uat

pm2 save

echo "==> PM2 status"
pm2 list

echo ""
echo "Backend deployed! Production API running at: https://api.openhand.live"
echo "Check logs: pm2 logs openhand-api --lines 50"
