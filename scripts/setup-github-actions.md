# 🚀 GitHub Actions Pipeline Setup Guide

This guide helps you set up the automated CI/CD pipeline for your personal website.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Fly.io Account**: You need a Fly.io account and app set up
3. **Deploy Token**: You mentioned having `PERSONAL_WEBSITE_DEPLOY_TOKEN`

## 🔧 Setup Steps

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secret:

- **Name**: `PERSONAL_WEBSITE_DEPLOY_TOKEN`
- **Value**: Your existing Fly.io deploy token

### 2. Update fly.toml (if needed)

Make sure your `fly.toml` has the correct app name:

```toml
app = "your-actual-app-name"
primary_region = "your-region"
```

### 3. Pipeline Overview

The pipeline runs on:

- **Push to main**: Full pipeline (test → build → deploy)
- **Pull requests**: Tests only (no deployment)

### 4. Pipeline Stages

1. **🧪 Test Job**:
   - Runs `npm run lint`
   - Runs `npm test` (unit tests)
   - Builds Storybook to verify components work

2. **🎭 E2E Test Job** (optional):
   - Only runs on push to main
   - Runs Playwright tests if configured
   - Won't block deployment if tests fail

3. **🏗️ Build Job**:
   - Builds Next.js application
   - Uploads build artifacts

4. **🚀 Deploy Job**:
   - Only runs on push to main
   - Deploys to Fly.io using your token
   - Runs after successful tests and build

## 📊 Monitoring

### View Pipeline Status

- Go to GitHub → Actions tab
- See all workflow runs and their status
- Download artifacts (build files, test reports)

### Deployment Status

- **Success**: Green checkmark, site is live
- **Failure**: Red X, check logs for errors
- **In Progress**: Yellow circle, pipeline running

## 🛠️ Customization

### Skip E2E Tests

If you want to disable E2E tests completely:

```yaml
# In .github/workflows/ci-cd.yml, change:
e2e-test:
  if: false # This disables the job
```

### Add Notifications

You can add Slack/Discord/email notifications by modifying the `notify` job.

### Deploy to Different Environments

You can add staging deployments by creating additional jobs for different branches.

## 🔍 Troubleshooting

### Common Issues

1. **Deploy fails with "app not found"**:
   - Check `fly.toml` app name matches your Fly.io app
   - Verify your deploy token has access to the app

2. **Tests fail on dependencies**:
   - Make sure all dependencies are in `package.json`
   - Check if any dev dependencies are missing

3. **Build fails**:
   - Test locally with `npm run build`
   - Check for TypeScript errors
   - Verify all imports are correct

### Debug Steps

1. **Check GitHub Actions logs**:
   - Go to Actions → Click failed run → View logs

2. **Test locally**:

   ```bash
   npm run lint
   npm test
   npm run build
   ```

3. **Fly.io debugging**:
   ```bash
   fly logs
   fly status
   ```

## 🚀 Next Steps

Once set up, your workflow will be:

1. **Development**: Work on feature branch
2. **Testing**: Create pull request (tests run automatically)
3. **Deployment**: Merge to main (full pipeline runs)
4. **Monitoring**: Check GitHub Actions and Fly.io dashboard

## 📝 Additional Configuration

### Environment Variables

If you need environment variables in production:

1. Add to GitHub Secrets
2. Add to pipeline:
   ```yaml
   env:
     NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
   ```

### Custom Domains

Configure custom domain in Fly.io dashboard after deployment.

---

Your pipeline is now ready! 🎉

Push to main branch to trigger the first deployment.
