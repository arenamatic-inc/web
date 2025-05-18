#!/bin/bash
set -e

echo "Syncing frontend src/"
rsync -avz --delete src/ ubuntu@webstaging:/home/ubuntu/web/frontend/src/

echo "Building and restarting web..."
ssh ubuntu@webstaging <<'EOF'
cd /home/ubuntu/web/frontend
npm run build
sudo systemctl restart web-frontend
EOF

