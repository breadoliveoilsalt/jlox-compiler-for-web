#!/bin/bash
# Setup ECR repositories for jlox application
# Usage: ./k8s/scripts/setup-ecr.sh [region]
# Example: ./k8s/scripts/setup-ecr.sh us-east-1

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

echo "Using AWS Account ID: $AWS_ACCOUNT_ID"
echo "Using Region: $REGION"
echo ""

# Authenticate Docker with ECR
echo "Authenticating Docker with ECR..."
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Create ECR repositories
echo "Creating ECR repositories..."

# Backend repository
if aws ecr describe-repositories --repository-names jlox-backend --region $REGION &>/dev/null; then
  echo "Repository jlox-backend already exists"
else
  aws ecr create-repository \
    --repository-name jlox-backend \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --output text
  echo "Created repository: jlox-backend"
fi

# Frontend repository
if aws ecr describe-repositories --repository-names jlox-frontend --region $REGION &>/dev/null; then
  echo "Repository jlox-frontend already exists"
else
  aws ecr create-repository \
    --repository-name jlox-frontend \
    --region $REGION \
    --image-scanning-configuration scanOnPush=true \
    --output text
  echo "Created repository: jlox-frontend"
fi

echo ""
echo "ECR repositories ready:"
echo "  Backend:  $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-backend:latest"
echo "  Frontend: $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest"
echo ""
echo "Export these for use in other scripts:"
echo "  export AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID"
echo "  export REGION=$REGION"
echo "  export BACKEND_IMAGE=\"$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-backend:latest\""
echo "  export FRONTEND_IMAGE=\"$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest\""

