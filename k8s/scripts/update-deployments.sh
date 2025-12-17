#!/bin/bash
# Update deployment manifests with ECR image URLs
# Usage: ./k8s/scripts/update-deployments.sh
#
# Requires: BACKEND_IMAGE and FRONTEND_IMAGE environment variables
# Example:
#   export BACKEND_IMAGE="123456789.dkr.ecr.us-east-1.amazonaws.com/jlox-backend:latest"
#   export FRONTEND_IMAGE="123456789.dkr.ecr.us-east-1.amazonaws.com/jlox-frontend:latest"
#   ./k8s/scripts/update-deployments.sh

set -e

if [ -z "$BACKEND_IMAGE" ] || [ -z "$FRONTEND_IMAGE" ]; then
  echo "Error: BACKEND_IMAGE and FRONTEND_IMAGE environment variables must be set"
  echo ""
  echo "Example:"
  echo "  export BACKEND_IMAGE=\"123456789.dkr.ecr.us-east-1.amazonaws.com/jlox-backend:latest\""
  echo "  export FRONTEND_IMAGE=\"123456789.dkr.ecr.us-east-1.amazonaws.com/jlox-frontend:latest\""
  echo "  ./k8s/scripts/update-deployments.sh"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"

echo "Updating deployment manifests..."
echo "  Backend image:  $BACKEND_IMAGE"
echo "  Frontend image: $FRONTEND_IMAGE"
echo ""

# Update backend deployment
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s|image:.*jlox-backend.*|image: $BACKEND_IMAGE|" "$K8S_DIR/backend-deployment.yaml"
  sed -i '' "s|image:.*jlox-frontend.*|image: $FRONTEND_IMAGE|" "$K8S_DIR/frontend-deployment.yaml"
else
  # Linux
  sed -i "s|image:.*jlox-backend.*|image: $BACKEND_IMAGE|" "$K8S_DIR/backend-deployment.yaml"
  sed -i "s|image:.*jlox-frontend.*|image: $FRONTEND_IMAGE|" "$K8S_DIR/frontend-deployment.yaml"
fi

echo "Updated:"
echo "  - $K8S_DIR/backend-deployment.yaml"
echo "  - $K8S_DIR/frontend-deployment.yaml"
echo ""
echo "⚠️  WARNING: These files have been modified with your ECR image URLs."
echo "   Do NOT commit these changes if this is a public repository!"
echo "   Consider using environment variable substitution or kustomize instead."

