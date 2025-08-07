#!/bin/bash

# Codespaces Environment Setup Script
echo "🚀 Setting up Campaign CMS for GitHub Codespaces..."

# Check if we're in Codespaces
if [ -n "$CODESPACE_NAME" ]; then
    echo "✅ Running in GitHub Codespaces: $CODESPACE_NAME"
    
    # Get the Codespaces domain
    CODESPACE_DOMAIN="${CODESPACE_NAME}-3001.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    
    # Create frontend environment for Codespaces
    cat > /workspaces/CampaignCMS/campaign-cms/frontend/.env << EOF
# Frontend Environment Variables for Codespaces
VITE_API_BASE_URL=https://${CODESPACE_DOMAIN}/api
VITE_NODE_ENV=development
EOF

    # Update backend environment for Codespaces
    cat > /workspaces/CampaignCMS/campaign-cms/.env << EOF
# Environment Configuration for Codespaces
NODE_ENV=development
PORT=3001
FRONTEND_PORT=3000
DB_PATH=./data/campaign_cms.sqlite
API_BASE_URL=https://${CODESPACE_DOMAIN}/api
FRONTEND_URL=https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}
LOG_LEVEL=info
EOF

    echo "✅ Environment configured for Codespaces"
    echo "🌐 Frontend URL: https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo "🔧 Backend URL: https://${CODESPACE_DOMAIN}"
    
else
    echo "💻 Running locally - no Codespaces configuration needed"
    echo "Using existing local .env files"
fi

echo "🎉 Setup complete! Run 'npm run dev:full' to start both servers"
