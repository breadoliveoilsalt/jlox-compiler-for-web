#!/bin/bash
# Deploy jlox application to EKS
# Usage: ./k8s/scripts/deploy-to-eks.sh [cluster-name] [region]
# Example: ./k8s/scripts/deploy-to-eks.sh jlox-cluster us-east-1
#
# This script assumes:
# - ECR images are already built and pushed
# - Deployment manifests have been updated with ECR image URLs
# - kubectl is configured for the EKS cluster

set -e

CLUSTER_NAME=${1:-${EKS_CLUSTER_NAME:-jlox-cluster}}
REGION=${2:-${AWS_REGION:-us-east-1}}

echo "Deploying to EKS cluster: $CLUSTER_NAME"
echo "Region: $REGION"
echo ""

# Verify kubectl is configured
if ! kubectl cluster-info &>/dev/null; then
  echo "Error: kubectl is not configured or cluster is not accessible"
  echo "Run: aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION"
  exit 1
fi

# Verify cluster name matches and warn if pointing to minikube
CURRENT_CONTEXT=$(kubectl config current-context)
if [[ "$CURRENT_CONTEXT" == *"minikube"* ]]; then
  echo "⚠️  WARNING: kubectl is currently pointing to minikube, not EKS!"
  echo "   Current context: $CURRENT_CONTEXT"
  echo "   Expected cluster: $CLUSTER_NAME"
  echo ""
  echo "   To switch to EKS, run:"
  echo "   aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION"
  echo ""
  exit 1
fi

if [[ ! "$CURRENT_CONTEXT" == *"$CLUSTER_NAME"* ]] && [[ ! "$CURRENT_CONTEXT" == *"eks"* ]]; then
  echo "Warning: Current kubectl context ($CURRENT_CONTEXT) may not match cluster name ($CLUSTER_NAME)"
  echo "Expected context to contain '$CLUSTER_NAME' or 'eks'"
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"

# Apply manifests
echo "Applying Kubernetes manifests..."
kubectl apply -f "$K8S_DIR/backend-deployment.yaml"
kubectl apply -f "$K8S_DIR/backend-service.yaml"
kubectl apply -f "$K8S_DIR/frontend-deployment.yaml"
kubectl apply -f "$K8S_DIR/frontend-service.yaml"

echo ""
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/jlox-backend
kubectl wait --for=condition=available --timeout=300s deployment/jlox-frontend

echo ""
echo "Deployment complete!"
echo ""
echo "Services:"
kubectl get services

echo ""
echo "Pods:"
kubectl get pods

echo ""
echo "To access the application:"
echo "  # If using LoadBalancer service:"
echo "  kubectl get service jlox-frontend-service"
echo ""
echo "  # If using Ingress:"
echo "  kubectl get ingress jlox-ingress"
echo ""
echo "  # Or use port-forward for testing:"
echo "  kubectl port-forward service/jlox-frontend-service 8080:80"

