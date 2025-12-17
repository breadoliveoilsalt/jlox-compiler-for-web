# Security Considerations

This repository is public. Please follow these security guidelines:

## Environment Variables

- **Never commit `.env` files** - They are excluded via `.gitignore`
- Use environment variables for sensitive configuration
- Document required environment variables in `README.md` or `DEPLOYMENT.md`
- Use placeholder values in documentation (e.g., `<account-id>`, `<region>`)

## Current Security Settings

### Backend API
- **CORS**: Currently configured to allow all origins (`cors()`)
  - For production, configure specific origins via `ALLOWED_ORIGINS` environment variable
  - Example: `ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`

### Kubernetes
- No hardcoded secrets in manifests
- Use Kubernetes Secrets for sensitive data (not included in this repo)
- Image URLs use placeholders - replace with actual ECR/registry URLs during deployment
- **⚠️ EKS Deployment**: The `update-deployments.sh` script modifies YAML files with ECR URLs containing your AWS Account ID
  - **DO NOT commit** these modified files to a public repository
  - Consider using kustomize, environment variable substitution, or CI/CD pipelines instead
  - Always review `git diff` before committing deployment files

### Docker
- No secrets in Dockerfiles
- Use build arguments or environment variables for configuration
- Never hardcode credentials in Dockerfiles

## Best Practices

1. **Secrets Management**:
   - Use Kubernetes Secrets for production deployments
   - Use environment variables, not hardcoded values
   - Rotate credentials regularly

2. **API Security**:
   - Consider adding rate limiting for production
   - Add request size limits
   - Validate and sanitize all inputs

3. **Container Security**:
   - Use minimal base images (Alpine Linux)
   - Keep dependencies up to date
   - Scan images for vulnerabilities

4. **Network Security**:
   - Use HTTPS in production
   - Configure proper CORS policies
   - Use network policies in Kubernetes if needed

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly rather than opening a public issue.

