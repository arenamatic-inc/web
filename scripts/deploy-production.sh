#!/bin/bash
set -e

#PROD_HOSTS=("ubuntu@webprod1" "ubuntu@webprod2")  # replace with actual DNS or IPs
PROD_HOSTS=("ubuntu@webprod1")  # replace with actual DNS or IPs
ENV_FILE=".env.production"
ENV="production"

for HOST in "${PROD_HOSTS[@]}"; do
  echo "Deploying frontend to $HOST..."

  echo "Syncing project..."
  rsync -avz --delete \
    --exclude=node_modules \
    --exclude=dist \
    ./ $HOST:/home/ubuntu/web/frontend/

  echo "Building and restarting web on $HOST..."
  ssh $HOST <<EOF
    cd /home/ubuntu/web/frontend
    ln -sf $ENV_FILE .env
    npm install
    npm run build -- --mode $ENV
    sudo systemctl restart web-frontend
EOF

done

