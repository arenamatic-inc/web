#!/bin/bash
set -e

REMOTE_HOST="ubuntu@webstaging"
ENV_FILE=".env.staging"
ENV="staging"

echo "Deploying frontend to STAGING..."

echo "Syncing full frontend project to $REMOTE_HOST..."
rsync -avz --delete \
  --exclude=node_modules \
  --exclude=dist \
  ./ $REMOTE_HOST:/home/ubuntu/web/frontend/

echo "Building and restarting web on $REMOTE_HOST..."
ssh $REMOTE_HOST <<EOF
  cd /home/ubuntu/web/frontend
  ln -sf $ENV_FILE .env
  npm install
  npm run build -- --mode $ENV
  sudo systemctl restart web-frontend
EOF

