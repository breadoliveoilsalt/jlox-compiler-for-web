# jlox-compiler-for-web

A small web app that lets you write and evaluate **jlox** code in the browser.

-   **Frontend**: React + Tailwind, served by nginx in production
-   **Backend**: Express API that runs the TypeScript implementation of the jlox compiler/interpreter

This project is based on the Lox language from Robert Nystrom’s book/site **Crafting Interpreters**: `https://craftinginterpreters.com/`.

The initial compiler logic was developed in: `https://github.com/breadoliveoilsalt/jlox-compiler-in-ts`.

## Quick start (local dev)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

-   Frontend dev server: `http://localhost:5173`
-   Backend API: `http://localhost:3001`

## Kubernetes & Deployment docs

-   **General deployment guide**: `DEPLOYMENT.md`
-   **Kubernetes manifests & local minikube workflow**: `k8s/README.md`
-   **AWS EKS deployment (ECR, Load Balancer Controller, Ingress/ALB)**: `k8s/EKS_DEPLOYMENT.md`
-   **Troubleshooting EKS + Ingress + image caching issues**: `k8s/TROUBLESHOOTING.md`

## Architecture (Kubernetes)

This is the high-level flow when deployed to Kubernetes (e.g. EKS with ALB Ingress):

```text
User Browser
  |
  |  HTTP GET /
  v
ALB / Ingress
  |
  |  route "/" -> Frontend Service -> Frontend Pods (nginx + React)
  v
Frontend (in browser)
  |
  |  HTTP POST /api/evaluate
  v
ALB / Ingress
  |
  |  route "/api/*" -> Backend Service -> Backend Pods (Express API)
  v
Backend evaluates code (TypeScript compiler/interpreter) -> returns JSON result
```

## Configuration

-   **Frontend**:
    -   **`VITE_API_URL`**: API base URL embedded at build time (for EKS + ALB Ingress, this should typically be `/api`).
-   **Backend**:
    -   **`PORT`**: defaults to `3001`
    -   **`ALLOWED_ORIGINS`**: optional CORS allowlist (comma-separated)
