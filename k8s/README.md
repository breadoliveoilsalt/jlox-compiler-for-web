# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the jlox compiler web application.

## Prerequisites

-   Kubernetes cluster (minikube or AWS EKS)
-   kubectl configured to access your cluster
-   Docker images built and available

## Installation

### macOS (using Homebrew)

1. **Install kubectl:**

    ```bash
    brew install kubectl
    ```

2. **Install minikube:**

    ```bash
    brew install minikube
    ```

3. **Install Docker Desktop:**
    - Option 1 (Manual): Download from https://www.docker.com/products/docker-desktop/
    - Option 2 (Homebrew): `brew install --cask docker`
    - After installation, open Docker Desktop from Applications and complete the setup wizard

### Verify Installation

```bash
docker --version
kubectl version --client
minikube version
```

## Security Note

⚠️ **This repository is public.** When deploying:

-   Replace all placeholder values (`<account-id>`, `<region>`, etc.) with your actual values
-   Never commit real AWS account IDs, ECR URLs, or other sensitive information
-   Use Kubernetes Secrets for any sensitive configuration (not included in this repo)

## Files

-   `backend-deployment.yaml` - Backend API deployment
-   `backend-service.yaml` - Backend service (ClusterIP)
-   `frontend-deployment.yaml` - Frontend React app deployment
-   `frontend-service.yaml` - Frontend service (LoadBalancer/NodePort)
-   `ingress.yaml` - Ingress for routing (optional)

## Local Development with minikube

### 1. Start minikube

```bash
minikube start
```

### 2. Build Docker images

```bash
# Build backend
docker build -t jlox-backend:latest -f backend/Dockerfile .

# Build frontend
docker build -t jlox-frontend:latest -f frontend/Dockerfile .

# Load images into minikube
minikube image load jlox-backend:latest
minikube image load jlox-frontend:latest
```

### 3. Deploy to minikube

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

### 4. Access the application

```bash
# Get the service URL
minikube service jlox-frontend-service

# Or use port-forward for testing
kubectl port-forward service/jlox-frontend-service 8080:80
# Then visit http://localhost:8080
```

### 5. For Ingress (optional)

```bash
# Enable ingress addon
minikube addons enable ingress

# Add to /etc/hosts (or equivalent)
echo "$(minikube ip) jlox.local" | sudo tee -a /etc/hosts

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Visit http://jlox.local
```

## AWS EKS Deployment

**For detailed EKS deployment instructions, see [EKS_DEPLOYMENT.md](./EKS_DEPLOYMENT.md)**

Quick reference:

### 1. Build and push images to ECR

```bash
# Authenticate with ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# Create ECR repositories
aws ecr create-repository --repository-name jlox-backend --region <region>
aws ecr create-repository --repository-name jlox-frontend --region <region>

# Build and tag images
docker build -t jlox-backend:latest -f backend/Dockerfile .
docker build -t jlox-frontend:latest -f frontend/Dockerfile .

docker tag jlox-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/jlox-backend:latest
docker tag jlox-frontend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/jlox-frontend:latest

# Push images
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/jlox-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/jlox-frontend:latest
```

### 2. Update image references in deployments

Edit `backend-deployment.yaml` and `frontend-deployment.yaml` to use your ECR image URLs:

```yaml
image: <account-id>.dkr.ecr.<region>.amazonaws.com/jlox-backend:latest
```

### 3. Deploy to EKS

```bash
# Ensure kubectl is configured for your EKS cluster
aws eks update-kubeconfig --name <cluster-name> --region <region>

# Apply manifests
kubectl apply -f k8s/
```

### 4. Access the application

```bash
# Get LoadBalancer URL
kubectl get service jlox-frontend-service

# Or set up Ingress with ALB
# (requires AWS Load Balancer Controller)
```

## Useful Commands

```bash
# Check pod status
kubectl get pods

# View logs
kubectl logs -f deployment/jlox-backend
kubectl logs -f deployment/jlox-frontend

# Describe resources
kubectl describe deployment jlox-backend
kubectl describe service jlox-backend-service

# Delete all resources
kubectl delete -f k8s/
```

## Troubleshooting

-   **Pods not starting**: Check `kubectl describe pod <pod-name>` for errors
-   **Image pull errors**: Ensure images are available in minikube or ECR
-   **Service not accessible**: Check service type and port mappings
-   **CORS errors**: Ensure backend CORS is configured correctly
