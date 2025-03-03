# Git Branching Strategy

## Overview

This repository uses a branching strategy with separate branches for deployment (production) and development work. This approach allows us to:

1. Keep a stable, production-ready codebase in the main branch
2. Work on new features and bug fixes in the development branch without affecting production
3. Merge changes into production only when they are tested and ready

## Branch Structure

- **`main`**: The production branch that contains stable, deployable code
- **`development`**: The development branch where all new work is done
- **`feature/feature-name`**: Feature branches created off development for specific features
- **`bugfix/bug-description`**: Bugfix branches created off development for specific bugs

## Workflow

### Starting New Work

1. Always create new feature or bugfix branches from the `development` branch:
   ```
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

2. Make changes in your feature branch, committing regularly with descriptive messages.

3. When your feature is complete, push it to the remote repository:
   ```
   git push origin feature/your-feature-name
   ```

4. Create a pull request to merge your feature branch into the `development` branch.

### Deploying to Production

1. When the `development` branch has been tested and is ready for production:
   ```
   git checkout main
   git pull origin main
   git merge development
   git push origin main
   ```

2. The changes will be automatically deployed to the production environment.

### Hotfixes for Production

1. If you need to fix a critical bug in production:
   ```
   git checkout main
   git pull origin main
   git checkout -b hotfix/bug-description
   ```

2. Fix the bug and test thoroughly.

3. Merge the hotfix into both `main` and `development`:
   ```
   git checkout main
   git merge hotfix/bug-description
   git push origin main
   
   git checkout development
   git merge hotfix/bug-description
   git push origin development
   ```

## Deployment

- The `main` branch deploys to the production environment at `/home/dotdashb/planning_tool`
- The `development` branch deploys to the development environment at `/home/dotdashb/planning_tool_dev`

## Best Practices

1. **Never commit directly to `main`** - always go through the proper workflow
2. Keep your branches up to date with their parent branches
3. Delete feature branches after they've been merged
4. Write meaningful commit messages
5. Regularly push your local changes to the remote repository 