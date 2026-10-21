#!/usr/bin/env bash
# Deploy OpenHand frontend to S3 + invalidate CloudFront
# Usage:
#   ./deploy/deploy-frontend-s3.sh uat
#   ./deploy/deploy-frontend-s3.sh production
#
# Env files (frontend/):
#   .env       → production build
#   .env.uat   → UAT build
#
# Optional overrides: UAT_BUCKET, UAT_CF_ID, PROD_BUCKET, PROD_CF_ID

set -euo pipefail

ENV="${1:-uat}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND="$ROOT/frontend"

UAT_BUCKET="${UAT_BUCKET:-openhand-uat-web}"
UAT_CF_ID="${UAT_CF_ID:-E19F3NCO1VDA0P}"
PROD_BUCKET="${PROD_BUCKET:-openhand-production-web}"
PROD_CF_ID="${PROD_CF_ID:-E3CG3DMQB80US2}"

if [[ "$ENV" == "production" || "$ENV" == "prod" ]]; then
  BUCKET="$PROD_BUCKET"
  CF_ID="$PROD_CF_ID"
  BUILD_SCRIPT="build:production"
else
  BUCKET="$UAT_BUCKET"
  CF_ID="$UAT_CF_ID"
  BUILD_SCRIPT="build:uat"
fi

echo "Deploy env=$ENV bucket=$BUCKET cf=$CF_ID"

cd "$FRONTEND"
npm install
npm run "$BUILD_SCRIPT"

aws s3 sync build/ "s3://$BUCKET/" --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --exclude "asset-manifest.json" \
  --exclude "service-worker.js"

aws s3 cp build/index.html "s3://$BUCKET/index.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html"

if [[ -n "$CF_ID" ]]; then
  aws cloudfront create-invalidation --distribution-id "$CF_ID" --paths "/*"
  echo "CloudFront invalidation sent: $CF_ID"
else
  echo "Skip invalidation (set UAT_CF_ID / PROD_CF_ID)"
fi

echo "Done. Open your CloudFront / custom domain URL."
