#!/bin/bash
set -e

ENV="$1"

if [ -z "$ENV" ]; then
  echo "Usage: $0 [staging|production]"
  exit 1
fi

if [ "$ENV" = "staging" ]; then
  REMOTE_HOST="ubuntu@webstaging"
  ENV_FILE=".env.staging"
elif [ "$ENV" = "production" ]; then
  REMOTE_HOST="ubuntu@webstaging"
  ENV_FILE=".env.production"
else
  echo "Invalid environment: $ENV"
  exit 1
fi

echo "Deploying frontend to $ENV..."

echo "Syncing full frontend project..."
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

