# Troubleshooting Guide

This guide covers common issues encountered when deploying the jlox compiler to AWS EKS and how to resolve them.

## Issue: Frontend Calling Wrong API URL

### Symptoms

- Frontend makes API calls to `http://localhost:3001/evaluate` instead of using the relative `/api/evaluate` path
- Browser shows 404 errors when trying to reach the backend
- Application works locally but fails when deployed to EKS

### Root Causes

1. **Frontend built without production API URL**: The frontend was built without the `VITE_API_URL` environment variable, causing it to default to `http://localhost:3001`
2. **Backend missing `/api/evaluate` route**: The backend only had `/evaluate` route, but ingress forwards requests as `/api/evaluate`
3. **Kubernetes image caching**: Pods were using cached images due to `imagePullPolicy: IfNotPresent` with `:latest` tags

### Solution

#### 1. Rebuild Frontend with Production API URL

The frontend must be built with `VITE_API_URL=/api` to use relative paths that work with ingress routing:

```bash
export AWS_REGION=us-east-1
./k8s/scripts/build-frontend-prod.sh $AWS_REGION
```

Or manually:

```bash
docker build \
  --platform linux/amd64 \
  --build-arg VITE_API_URL=/api \
  --no-cache \
  -f frontend/Dockerfile \
  -t jlox-frontend:latest .

# Tag and push to ECR
docker tag jlox-frontend:latest $ECR_IMAGE
docker push $ECR_IMAGE
```

#### 2. Add `/api/evaluate` Route to Backend

The backend needs to handle both `/evaluate` and `/api/evaluate` routes because:
- Ingress routes `/api` (prefix) to the backend service
- AWS ALB Ingress Controller forwards the full path `/api/evaluate` to the backend

Update `backend/index.ts`:

```typescript
// Handler for evaluate endpoint
const evaluateHandler = async (req: Request, res: Response) => {
  // ... handler implementation
};

// Support both /evaluate and /api/evaluate for ingress routing
app.post('/evaluate', evaluateHandler);
app.post('/api/evaluate', evaluateHandler);
```

Then rebuild and push the backend:

```bash
docker build --platform linux/amd64 --no-cache -f backend/Dockerfile -t jlox-backend:latest .
docker tag jlox-backend:latest $ECR_BACKEND_IMAGE
docker push $ECR_BACKEND_IMAGE
```

#### 3. Update Deployment Image Pull Policy

Change `imagePullPolicy` from `IfNotPresent` to `Always` in both frontend and backend deployments to ensure the latest images are always pulled:

```yaml
# k8s/frontend-deployment.yaml and k8s/backend-deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: frontend  # or backend
        image: <ECR_IMAGE>
        imagePullPolicy: Always  # Changed from IfNotPresent
```

Apply the changes:

```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
```

#### 4. Force Pod Restart

After updating images, force pods to restart and pull the latest images:

```bash
# Restart deployments
kubectl rollout restart deployment/jlox-frontend
kubectl rollout restart deployment/jlox-backend

# Or delete pods to force recreation
kubectl delete pods -l app=jlox-frontend
kubectl delete pods -l app=jlox-backend

# Wait for rollout
kubectl rollout status deployment/jlox-frontend
kubectl rollout status deployment/jlox-backend
```

## Troubleshooting Commands

### Verify Frontend API URL

Check if the built frontend JavaScript contains the correct API URL:

```bash
# Get the JavaScript file name from the pod
kubectl exec deployment/jlox-frontend -- ls /usr/share/nginx/html/assets/

# Check for API URL in the built JavaScript
kubectl exec deployment/jlox-frontend -- grep -o "localhost:3001\|/api" /usr/share/nginx/html/assets/index-*.js | head -5
```

Expected output should show `/api`, not `localhost:3001`.

### Verify Backend Routes

Check if the backend has the `/api/evaluate` route:

```bash
# Check backend source code in pod
kubectl exec deployment/jlox-backend -- cat /app/backend/index.ts | grep -E "app\.post.*api" -A 1
```

Expected output:
```
app.post('/api/evaluate', evaluateHandler);
```

### Check Pod Images

Verify pods are using the correct images:

```bash
# Check frontend pod image
kubectl get pods -l app=jlox-frontend -o jsonpath='{.items[0].status.containerStatuses[0].imageID}'

# Check backend pod image
kubectl get pods -l app=jlox-backend -o jsonpath='{.items[0].status.containerStatuses[0].imageID}'

# Compare with latest ECR image digest
aws ecr describe-images \
  --repository-name jlox-frontend \
  --region us-east-1 \
  --query 'imageDetails[0].imageDigest' \
  --output text
```

### Check Deployment Configuration

Verify deployment is configured correctly:

```bash
# Check image pull policy
kubectl get deployment jlox-frontend -o jsonpath='{.spec.template.spec.containers[0].imagePullPolicy}'
kubectl get deployment jlox-backend -o jsonpath='{.spec.template.spec.containers[0].imagePullPolicy}'

# Check image being used
kubectl get deployment jlox-frontend -o jsonpath='{.spec.template.spec.containers[0].image}'
kubectl get deployment jlox-backend -o jsonpath='{.spec.template.spec.containers[0].image}'
```

### Check Ingress Configuration

Verify ingress is routing correctly:

```bash
# Check ingress rules
kubectl get ingress jlox-ingress -o yaml | grep -A 15 "spec:"

# Check ingress status (ALB URL)
kubectl get ingress jlox-ingress
```

### View Logs

Check application logs for errors:

```bash
# Frontend logs
kubectl logs -l app=jlox-frontend --tail=50

# Backend logs
kubectl logs -l app=jlox-backend --tail=50 -f

# Follow logs in real-time
kubectl logs -l app=jlox-backend -f
```

### Test Backend Directly

Test the backend endpoint directly via port-forward:

```bash
# Port-forward backend service
kubectl port-forward service/jlox-backend-service 3001:3001 &

# Test /evaluate endpoint
curl -X POST http://localhost:3001/evaluate \
  -H "Content-Type: application/json" \
  -d '{"code":"print 1;"}'

# Test /api/evaluate endpoint
curl -X POST http://localhost:3001/api/evaluate \
  -H "Content-Type: application/json" \
  -d '{"code":"print 1;"}'
```

### Check Browser Network Tab

1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Make a request from the application
4. Check the Request URL - it should be a relative path like `/api/evaluate`, not `http://localhost:3001/evaluate`

### Verify Image Build

When building images, ensure you're using the correct build arguments:

```bash
# Frontend - must include VITE_API_URL
docker build \
  --platform linux/amd64 \
  --build-arg VITE_API_URL=/api \
  --no-cache \
  -f frontend/Dockerfile \
  -t jlox-frontend:latest .

# Backend - ensure latest code is included
docker build \
  --platform linux/amd64 \
  --no-cache \
  -f backend/Dockerfile \
  -t jlox-backend:latest .
```

## Common Issues and Quick Fixes

### Issue: Pods not updating after image push

**Fix**: Change `imagePullPolicy` to `Always` and restart pods:

```bash
kubectl set image deployment/jlox-frontend frontend=$ECR_IMAGE
kubectl delete pods -l app=jlox-frontend
```

### Issue: Frontend still calling localhost

**Fix**: Rebuild frontend with `VITE_API_URL=/api` and clear browser cache (hard refresh: Ctrl+Shift+R or Cmd+Shift+R).

### Issue: Backend returns 404 for `/api/evaluate`

**Fix**: Ensure backend has both `/evaluate` and `/api/evaluate` routes, rebuild, and redeploy.

### Issue: Ingress not routing correctly

**Fix**: Verify ingress is using the correct `ingressClassName` (should be `alb` for EKS) and paths are configured correctly:

```bash
kubectl get ingress jlox-ingress -o yaml
```

## Prevention

To prevent these issues in the future:

1. **Always use `imagePullPolicy: Always`** when using `:latest` tags in production
2. **Use semantic versioning** for images instead of `:latest` tags
3. **Build frontend with production API URL** using the build script: `./k8s/scripts/build-frontend-prod.sh`
4. **Test both routes** (`/evaluate` and `/api/evaluate`) when deploying backend changes
5. **Verify image digests** match between ECR and running pods after deployment

## Related Documentation

- [EKS Deployment Guide](./EKS_DEPLOYMENT.md)
- [Kubernetes README](./README.md)
- [Deployment Guide](../DEPLOYMENT.md)

