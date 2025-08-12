# Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to manage git hooks for code quality.

## Setup

Git hooks are automatically installed when you run `npm install` (via the `prepare` script).

## Hooks

### Pre-commit Hook

- **Purpose**: Automatically fix linting issues in staged files
- **Command**: `npx lint-staged`
- **What it does**:
  - Runs `next lint --fix --file` on staged TypeScript/JavaScript files
  - Automatically fixes fixable ESLint violations
  - Adds fixed files back to the commit

### Pre-push Hook

- **Purpose**: Ensure code quality before pushing to remote
- **Commands**:
  - `npm run lint:check` - Runs ESLint with `--max-warnings 0`
  - `npm run format:check` - Runs format check (currently same as lint:check)
- **What it does**:
  - Fails the push if there are any ESLint errors or warnings
  - Ensures consistent code quality in the repository

## ESLint Auto-fixing

Yes! ESLint can auto-fix many violations including:

- ✅ Semicolon insertion/removal
- ✅ Quote style (single vs double)
- ✅ Indentation and spacing
- ✅ Import organization
- ✅ Unused imports removal
- ❌ Type annotations (like `any` → proper types)
- ❌ Logic errors
- ❌ Complex refactoring

## Manual Commands

You can run these commands manually:

```bash
# Fix all fixable issues
npm run lint:fix

# Check for issues without fixing
npm run lint:check

# Regular lint (warnings allowed)
npm run lint
```

## Bypassing Hooks (Emergency Only)

If you need to bypass hooks in an emergency:

```bash
# Skip pre-commit hook
git commit --no-verify

# Skip pre-push hook
git push --no-verify
```

**Note**: Only use `--no-verify` in emergencies. The hooks are there to maintain code quality.
