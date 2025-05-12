#!/bin/bash

set -euo pipefail

REPO_DIR="/home/ubuntu/web"
BRANCH="production"
FRONTEND_DIR="$REPO_DIR/frontend"

echo "📦 Pulling latest code from $BRANCH..."
cd "$REPO_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo "🛠 Building frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

echo "✅ Frontend built successfully."

# Optional: restart serve or nginx
# echo "🔄 Restarting server..."
# sudo systemctl restart web-frontend

echo "✅ Deployment complete."

