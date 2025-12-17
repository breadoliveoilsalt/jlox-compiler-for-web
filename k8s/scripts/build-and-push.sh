#!/bin/bash
# Build and push Docker images to ECR
# Usage: ./k8s/scripts/build-and-push.sh [region]
# Example: ./k8s/scripts/build-and-push.sh us-east-1
#
# Requires: AWS_ACCOUNT_ID and REGION environment variables
#           Or run setup-ecr.sh first which sets these

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
BACKEND_IMAGE="$ECR_BASE/jlox-backend:latest"
FRONTEND_IMAGE="$ECR_BASE/jlox-frontend:latest"

echo "Using AWS Account ID: $AWS_ACCOUNT_ID"
echo "Using Region: $REGION"
echo ""

# Authenticate Docker with ECR
echo "Authenticating Docker with ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ECR_BASE

# Build backend for linux/amd64 (EKS nodes)
echo "Building backend image for linux/amd64..."
docker build --platform linux/amd64 --no-cache -f backend/Dockerfile -t jlox-backend:latest .

# Tag backend
echo "Tagging backend image..."
docker tag jlox-backend:latest $BACKEND_IMAGE

# Push backend
echo "Pushing backend image to ECR..."
docker push $BACKEND_IMAGE

# Build frontend for linux/amd64 (EKS nodes)
echo "Building frontend image for linux/amd64..."
docker build --platform linux/amd64 --no-cache -f frontend/Dockerfile -t jlox-frontend:latest .

# Tag frontend
echo "Tagging frontend image..."
docker tag jlox-frontend:latest $FRONTEND_IMAGE

# Push frontend
echo "Pushing frontend image to ECR..."
docker push $FRONTEND_IMAGE

echo ""
echo "Images pushed successfully:"
echo "  Backend:  $BACKEND_IMAGE"
echo "  Frontend: $FRONTEND_IMAGE"
echo ""
echo "Export these for deployment:"
echo "  export BACKEND_IMAGE=\"$BACKEND_IMAGE\""
echo "  export FRONTEND_IMAGE=\"$FRONTEND_IMAGE\""

