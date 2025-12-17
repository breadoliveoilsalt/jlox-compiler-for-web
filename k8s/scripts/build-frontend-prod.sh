#!/bin/bash
# Build frontend for production with /api URL for Ingress
# Usage: ./k8s/scripts/build-frontend-prod.sh [region]
# Example: ./k8s/scripts/build-frontend-prod.sh us-east-1
#
# Requires: AWS_ACCOUNT_ID and REGION environment variables

set -e

REGION=${1:-${AWS_REGION:-us-east-1}}

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Getting AWS Account ID..."
  AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
fi

if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "Error: Could not determine AWS Account ID. Please set AWS_ACCOUNT_ID or configure AWS CLI."
  exit 1
fi

ECR_BASE="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
FRONTEND_IMAGE="$ECR_BASE/jlox-frontend:latest"

echo "Building frontend for production (with VITE_API_URL=/api)..."
echo "Using AWS Account ID: $AWS_ACCOUNT_ID"
echo "Using Region: $REGION"
echo ""

# Authenticate Docker with ECR
echo "Authenticating Docker with ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_BASE

# Build frontend with production API URL for linux/amd64 (EKS nodes)
echo "Building frontend image with VITE_API_URL=/api for linux/amd64..."
docker build \
  --platform linux/amd64 \
  --build-arg VITE_API_URL=/api \
  --no-cache \
  -f frontend/Dockerfile \
  -t jlox-frontend:latest .

# Tag frontend
echo "Tagging frontend image..."
docker tag jlox-frontend:latest $FRONTEND_IMAGE

# Push frontend
echo "Pushing frontend image to ECR..."
docker push $FRONTEND_IMAGE

echo ""
echo "Frontend image pushed successfully:"
echo "  $FRONTEND_IMAGE"
echo ""
echo "This image is configured to use /api for backend API calls (for Ingress routing)."

