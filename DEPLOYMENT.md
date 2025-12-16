# Deployment Guide

This guide covers deploying the jlox compiler web application to Kubernetes.

## Project Structure

```
jlox-compiler-for-web/
├── backend/          # Express API server
├── frontend/         # React + Tailwind frontend
├── compiler/         # Core jlox compiler logic
├── parser/           # AST parser
├── scanner/          # Token scanner
├── k8s/              # Kubernetes manifests
└── Dockerfiles       # Container definitions
```

## Quick Start

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access:**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Building Docker Images

### Backend
```bash
docker build -t jlox-backend:latest -f backend/Dockerfile .
```

### Frontend
```bash
docker build -t jlox-frontend:latest -f frontend/Dockerfile .
```

## Kubernetes Deployment

See [k8s/README.md](./k8s/README.md) for detailed Kubernetes deployment instructions.

### Quick Deploy to minikube

```bash
# Start minikube
minikube start

# Build and load images
docker build -t jlox-backend:latest -f backend/Dockerfile .
docker build -t jlox-frontend:latest -f frontend/Dockerfile .
minikube image load jlox-backend:latest
minikube image load jlox-frontend:latest

# Deploy
kubectl apply -f k8s/

# Access
minikube service jlox-frontend-service
```

### Quick Deploy to AWS EKS

1. Build and push to ECR (see k8s/README.md)
2. Update image URLs in deployment files
3. Apply manifests:
   ```bash
   kubectl apply -f k8s/
   ```

## Environment Variables

### Backend
- `PORT` - Server port (default: 3001)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins (optional)
  - Example: `https://example.com,https://www.example.com`
  - If not set, allows all origins (development mode)

### Frontend
- `VITE_API_URL` - Backend API URL
  - Local dev: `http://localhost:3001`
  - Kubernetes: `/api` (when using Ingress) or backend service URL

## Security

⚠️ **This repository is public.** See [SECURITY.md](./SECURITY.md) for security guidelines.

- Never commit `.env` files or secrets
- Use environment variables for configuration
- Configure CORS properly for production
- Use Kubernetes Secrets for sensitive data

## Architecture

- **Frontend**: React SPA served by nginx
- **Backend**: Express API server
- **Communication**: REST API (POST /api/evaluate)
- **State**: Stateless (each request is independent)

## API Endpoints

### POST /api/evaluate
Evaluates jlox code.

**Request:**
```json
{
  "code": "var x = 10;\nprint x;"
}
```

**Response:**
```json
{
  "result": null,
  "output": ["10"],
  "error": null
}
```

### GET /health
Health check endpoint.

## Troubleshooting

- **CORS errors**: Ensure backend CORS is configured
- **API connection**: Check VITE_API_URL environment variable
- **Kubernetes networking**: Verify service selectors and port mappings
- **Image pull errors**: Ensure images are available in cluster

