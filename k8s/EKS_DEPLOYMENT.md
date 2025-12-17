# AWS EKS Deployment Guide

This guide walks you through deploying the jlox compiler web application to AWS EKS.

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
    ```bash
    aws --version
    aws configure  # If not already configured
    ```
3. **kubectl** installed (see `k8s/README.md` for installation)
4. **eksctl** (recommended) or AWS Console for cluster creation

    For AWS-sanctioned installation instructions, see: [Installation options for eksctl](https://docs.aws.amazon.com/eks/latest/eksctl/installation.html)

    Quick install options:

    ```bash
    # Install eksctl (macOS/Linux with Homebrew)
    brew tap aws/tap
    brew install aws/tap/eksctl

    # Or download from: https://github.com/eksctl-io/eksctl/releases
    ```

5. **Helm** (required for installing AWS Load Balancer Controller)

    For AWS-sanctioned installation instructions, see: [Deploy applications with Helm on Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/helm.html)

    Quick install (macOS):

    ```bash
    brew install helm
    ```

6. **Docker** installed and running

## Step 1: Create EKS Cluster

### Option A: Using eksctl (Recommended)

```bash
# Set your variables
export CLUSTER_NAME=jlox-cluster
export REGION=us-east-1  # Change to your preferred region
export NODE_TYPE=t3.medium
export NODE_COUNT=2

# Create cluster (this takes 15-20 minutes)
eksctl create cluster \
  --name $CLUSTER_NAME \
  --region $REGION \
  --node-type $NODE_TYPE \
  --nodes $NODE_COUNT \
  --nodes-min 1 \
  --nodes-max 3 \
  --managed

# Configure kubectl
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Verify cluster access
kubectl get nodes
```

### Option B: Using AWS Console

1. Go to AWS EKS Console
2. Click "Create cluster"
3. Configure:
    - Name: `jlox-cluster`
    - Kubernetes version: Latest stable
    - Node group: t3.medium, 2 nodes
4. Wait for cluster creation (15-20 minutes)
5. Configure kubectl:
    ```bash
    aws eks update-kubeconfig --name jlox-cluster --region <your-region>
    ```

## Step 2: Set Up ECR Repositories

```bash
# Set variables
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REGION=us-east-1  # Match your cluster region

# Authenticate Docker with ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Create ECR repositories
aws ecr create-repository \
  --repository-name jlox-backend \
  --region $REGION \
  --image-scanning-configuration scanOnPush=true

aws ecr create-repository \
  --repository-name jlox-frontend \
  --region $REGION \
  --image-scanning-configuration scanOnPush=true

# Note the repository URIs (you'll need these)
echo "Backend ECR: $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-backend:latest"
echo "Frontend ECR: $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest"
```

## Step 3: Build and Push Docker Images

### Option A: Using Helper Scripts (Recommended)

```bash
# Set variables (from Step 2)
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REGION=us-east-1

# Build and push both images
./k8s/scripts/build-and-push.sh $REGION

# For production with Ingress, rebuild frontend with /api URL
./k8s/scripts/build-frontend-prod.sh $REGION
```

### Option B: Manual Build and Push

```bash
# Set variables (use the same values from Step 2)
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REGION=us-east-1

# Authenticate (if not already done)
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Build images
docker build --no-cache -f backend/Dockerfile -t jlox-backend:latest .
docker build --no-cache -f frontend/Dockerfile -t jlox-frontend:latest .

# For production with Ingress, build frontend with /api URL:
docker build \
  --build-arg VITE_API_URL=/api \
  --no-cache \
  -f frontend/Dockerfile \
  -t jlox-frontend:latest .

# Tag images for ECR
docker tag jlox-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-backend:latest

docker tag jlox-frontend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest

# Push images
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest
```

## Step 4: Update Deployment Manifests

⚠️ **IMPORTANT**: The deployment manifests use placeholder image names. You must update them with your ECR image URLs before deploying.

### Option A: Using Helper Script (Recommended)

```bash
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export REGION=us-east-1
export BACKEND_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-backend:latest"
export FRONTEND_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest"

# Update deployment files
./k8s/scripts/update-deployments.sh
```

**⚠️ WARNING**: This script modifies the YAML files with your ECR URLs. Do NOT commit these changes to a public repository! Consider using kustomize or environment variable substitution for production.

### Option B: Manual Edit

Edit `k8s/backend-deployment.yaml`:

```yaml
image: <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/jlox-backend:latest
```

Edit `k8s/frontend-deployment.yaml`:

```yaml
image: <your-account-id>.dkr.ecr.<your-region>.amazonaws.com/jlox-frontend:latest
```

Replace `<your-account-id>` and `<your-region>` with your actual values.

## Step 5: Configure kubectl for EKS

⚠️ **IMPORTANT**: If you've been using minikube locally, kubectl is likely pointing to your minikube cluster. You must switch to your EKS cluster before deploying.

### Verify Current Context

```bash
# Check which cluster kubectl is currently pointing to
kubectl config current-context

# List all available contexts
kubectl config get-contexts
```

### Configure kubectl for EKS

```bash
# Set your cluster name and region
export CLUSTER_NAME=jlox-cluster
export REGION=us-east-1

# Configure kubectl to use your EKS cluster
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

# Verify you're connected to the correct cluster
kubectl config current-context
# Should show something like: arn:aws:eks:us-east-1:123456789012:cluster/jlox-cluster

# Verify you can access the cluster
kubectl get nodes
# Should show your EKS worker nodes (not minikube)
```

**Note**: If you see `minikube` in the context name or minikube nodes, you're still connected to minikube. Make sure to run `aws eks update-kubeconfig` and verify the context changed.

## Step 6: Configure Frontend for Production

The frontend needs to use a relative `/api` URL when deployed with Ingress. This is already configured via the `VITE_API_URL` environment variable.

For EKS with Ingress, we'll set this during deployment (see Step 7).

## Step 7: Deploy to EKS

### Option A: Using Helper Script

```bash
export EKS_CLUSTER_NAME=jlox-cluster
export AWS_REGION=us-east-1

# Deploy all resources
./k8s/scripts/deploy-to-eks.sh $EKS_CLUSTER_NAME $AWS_REGION
```

### Option B: Manual Deployment

#### Using LoadBalancer Service (Simplest)

```bash
# Apply all manifests
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Wait for LoadBalancer to be provisioned
kubectl get service jlox-frontend-service

# Get the LoadBalancer URL (EXTERNAL-IP column)
# This may take 2-5 minutes to provision
kubectl get service jlox-frontend-service -w
```

**Note:** With LoadBalancer, the frontend will be accessible directly, but API calls will fail because the frontend is configured for `localhost:3001`. You'll need to either:

1. Use Ingress (see below), or
2. Rebuild frontend with the LoadBalancer URL as the API endpoint

#### Using Ingress with AWS Load Balancer Controller (Recommended)

###### 7.1 Install AWS Load Balancer Controller

**Prerequisite:** Ensure Helm is installed. See [Deploy applications with Helm on Amazon EKS](https://docs.aws.amazon.com/eks/latest/userguide/helm.html) for installation instructions.

```bash
# Add the EKS chart repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=$CLUSTER_NAME \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify installation
kubectl get deployment -n kube-system aws-load-balancer-controller
```

**Note:** If the above fails, you may need to create the IAM service account first. See [AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html).

##### 7.2 Build Frontend for Production (if not already done)

If you haven't already built the frontend with `/api` URL in Step 3, do it now:

```bash
# Using helper script
./k8s/scripts/build-frontend-prod.sh $REGION

# Or manually
docker build \
  --build-arg VITE_API_URL=/api \
  --no-cache \
  -f frontend/Dockerfile \
  -t jlox-frontend:latest .

docker tag jlox-frontend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest

# Update deployment manifest and restart
kubectl set image deployment/jlox-frontend \
  frontend=$AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/jlox-frontend:latest
```

##### 7.3 Apply Ingress

```bash
# Apply ingress (update host if needed)
kubectl apply -f k8s/ingress.yaml

# Get Ingress URL
kubectl get ingress jlox-ingress

# The ADDRESS column will show your ALB URL
# It may take 2-5 minutes to provision
```

## Step 7: Verify Deployment

```bash
# Check pods
kubectl get pods

# Check services
kubectl get services

# Check ingress
kubectl get ingress

# View logs
kubectl logs -f deployment/jlox-backend
kubectl logs -f deployment/jlox-frontend

# Test backend health
kubectl port-forward service/jlox-backend-service 3001:3001 &
curl http://localhost:3001/health
```

## Step 8: Access the Application

### With LoadBalancer Service:

```bash
# Get the LoadBalancer URL
kubectl get service jlox-frontend-service

# Visit the EXTERNAL-IP in your browser
# Note: API calls may not work unless frontend is configured correctly
```

### With Ingress:

```bash
# Get the Ingress URL
kubectl get ingress jlox-ingress

# Visit the ADDRESS in your browser
# Example: http://k8s-default-jloxingr-xxxxx.us-east-1.elb.amazonaws.com
```

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Image pull errors

-   Verify ECR authentication: `aws ecr get-login-password --region $REGION`
-   Check image exists: `aws ecr describe-images --repository-name jlox-backend --region $REGION`
-   Verify image URL in deployment matches ECR URL

### LoadBalancer stuck in "pending"

-   Check AWS Load Balancer Controller logs: `kubectl logs -n kube-system deployment/aws-load-balancer-controller`
-   Verify IAM permissions for the controller service account

### CORS errors

-   Ensure backend `ALLOWED_ORIGINS` environment variable includes your frontend URL
-   Or set it to allow all origins for testing: `ALLOWED_ORIGINS=*` (not recommended for production)

### Frontend can't reach backend

-   Verify Ingress is routing `/api` to backend service
-   Check backend service is ClusterIP and accessible internally
-   Test backend directly: `kubectl port-forward service/jlox-backend-service 3001:3001`

## Cleanup

```bash
# Delete all resources
kubectl delete -f k8s/

# Delete ECR repositories (optional)
aws ecr delete-repository --repository-name jlox-backend --region $REGION --force
aws ecr delete-repository --repository-name jlox-frontend --region $REGION --force

# Delete EKS cluster
eksctl delete cluster --name $CLUSTER_NAME --region $REGION
```

## Cost Considerations

-   **EKS Cluster**: ~$0.10/hour (~$73/month) for the control plane
-   **EC2 Nodes**: Depends on instance type (t3.medium ~$0.0416/hour = ~$30/month per node)
-   **ECR**: Storage costs (~$0.10/GB/month) + data transfer
-   **Load Balancer**: ~$0.0225/hour (~$16/month) for ALB
-   **Total estimated**: ~$100-150/month for a small cluster with 2 nodes

Consider using Fargate for serverless option (no node management, pay per pod).
