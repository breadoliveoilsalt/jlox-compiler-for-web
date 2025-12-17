# Deployment Scripts

Helper scripts for deploying the jlox application to AWS EKS.

## ⚠️ Security Warning

**These scripts use environment variables and placeholders. Never commit:**
- AWS Account IDs
- ECR image URLs with account IDs
- AWS credentials
- Cluster names with sensitive information

## Prerequisites

1. AWS CLI configured (`aws configure`)
2. Docker installed and running
3. kubectl installed
4. EKS cluster created (see `EKS_DEPLOYMENT.md`)

## Quick Start

```bash
# 1. Set up ECR repositories
export REGION=us-east-1  # Your preferred region
./k8s/scripts/setup-ecr.sh $REGION

# 2. Build and push images
./k8s/scripts/build-and-push.sh $REGION

# 3. Build frontend for production (with /api URL for Ingress)
./k8s/scripts/build-frontend-prod.sh $REGION

# 4. Update deployment manifests with ECR image URLs
export BACKEND_IMAGE="<your-account-id>.dkr.ecr.<region>.amazonaws.com/jlox-backend:latest"
export FRONTEND_IMAGE="<your-account-id>.dkr.ecr.<region>.amazonaws.com/jlox-frontend:latest"
./k8s/scripts/update-deployments.sh

# 5. Deploy to EKS
export EKS_CLUSTER_NAME=jlox-cluster
./k8s/scripts/deploy-to-eks.sh $EKS_CLUSTER_NAME $REGION
```

## Scripts

### `setup-ecr.sh`
Creates ECR repositories for backend and frontend images.

**Usage:**
```bash
./k8s/scripts/setup-ecr.sh [region]
```

**Environment Variables:**
- `AWS_ACCOUNT_ID` (optional, will be auto-detected)
- `AWS_REGION` (optional, defaults to us-east-1)

### `build-and-push.sh`
Builds and pushes both backend and frontend Docker images to ECR.

**Usage:**
```bash
./k8s/scripts/build-and-push.sh [region]
```

**Environment Variables:**
- `AWS_ACCOUNT_ID` (optional, will be auto-detected)
- `AWS_REGION` (optional, defaults to us-east-1)

### `build-frontend-prod.sh`
Builds frontend with `VITE_API_URL=/api` for production Ingress routing.

**Usage:**
```bash
./k8s/scripts/build-frontend-prod.sh [region]
```

**Environment Variables:**
- `AWS_ACCOUNT_ID` (optional, will be auto-detected)
- `AWS_REGION` (optional, defaults to us-east-1)

### `update-deployments.sh`
Updates deployment YAML files with ECR image URLs.

**Usage:**
```bash
export BACKEND_IMAGE="<account-id>.dkr.ecr.<region>.amazonaws.com/jlox-backend:latest"
export FRONTEND_IMAGE="<account-id>.dkr.ecr.<region>.amazonaws.com/jlox-frontend:latest"
./k8s/scripts/update-deployments.sh
```

**⚠️ WARNING**: This modifies the YAML files. Do NOT commit these changes if your repository is public!

### `deploy-to-eks.sh`
Deploys the application to EKS cluster.

**Usage:**
```bash
./k8s/scripts/deploy-to-eks.sh [cluster-name] [region]
```

**Environment Variables:**
- `EKS_CLUSTER_NAME` (optional, defaults to jlox-cluster)
- `AWS_REGION` (optional, defaults to us-east-1)

**Prerequisites:**
- kubectl configured for the EKS cluster
- Deployment manifests updated with ECR image URLs

## Environment Variables Summary

Common variables used across scripts:

```bash
# AWS Configuration
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-east-1

# ECR Image URLs
export BACKEND_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/jlox-backend:latest"
export FRONTEND_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/jlox-frontend:latest"

# EKS Configuration
export EKS_CLUSTER_NAME=jlox-cluster
```

## Troubleshooting

### Scripts fail with "AWS Account ID not found"
- Ensure AWS CLI is configured: `aws configure`
- Verify credentials: `aws sts get-caller-identity`

### Docker login fails
- Run `setup-ecr.sh` first to authenticate
- Or manually: `aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com`

### kubectl not configured
- Run: `aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $REGION`
- Verify: `kubectl get nodes`

### Image pull errors in Kubernetes
- Verify images exist in ECR: `aws ecr describe-images --repository-name jlox-backend --region $REGION`
- Check deployment YAML has correct ECR image URL
- Verify EKS nodes have IAM permissions to pull from ECR

