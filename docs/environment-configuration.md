# Environment Configuration

This project uses a **Zod-based configuration system** for type-safe environment variable management with direct profile URLs.

## Quick Start

1. **For local development, edit `.env.local`:**

   ```bash
   GITHUB_PROFILE_URL=https://github.com/yourusername
   LINKEDIN_PROFILE_URL=https://linkedin.com/in/yourusername
   INSTAGRAM_PROFILE_URL=https://instagram.com/yourusername
   CONTACT_EMAIL_ADDRESS=your.email@example.com
   ```

2. **For production deployment, run the setup script:**
   ```bash
   ./scripts/setup-profile-secrets.sh
   ```

## Environment Variables

### Required Profile URLs

| Variable                | Description                | Example                            |
| ----------------------- | -------------------------- | ---------------------------------- |
| `GITHUB_PROFILE_URL`    | Full GitHub profile URL    | `https://github.com/username`      |
| `LINKEDIN_PROFILE_URL`  | Full LinkedIn profile URL  | `https://linkedin.com/in/username` |
| `INSTAGRAM_PROFILE_URL` | Full Instagram profile URL | `https://instagram.com/username`   |
| `CONTACT_EMAIL_ADDRESS` | Contact email address      | `hello@example.com`                |

**Note:** Copyright year is automatically set to the current year - no configuration needed.

## Environment File Structure

Following Python conventions for clarity:

```
.env                     # ❌ Ignored - may contain secrets during development
.env.local               # ❌ Ignored - personal development overrides
.env.production          # ✅ Committed - production defaults
.env.staging            # ✅ Committed - staging configuration
```

## How It Works

### 1. **Simple Schema** (`src/lib/config.ts`)

```typescript
const ConfigSchema = z.object({
	githubUrl: z.string().url().optional(),
	linkedinUrl: z.string().url().optional(),
	instagramUrl: z.string().url().optional(),
	emailAddress: z.string().email().optional(),
})
```

### 2. **Direct URL Reading**

```typescript
const rawConfig = {
	githubUrl: process.env.GITHUB_PROFILE_URL,
	linkedinUrl: process.env.LINKEDIN_PROFILE_URL,
	instagramUrl: process.env.INSTAGRAM_PROFILE_URL,
	emailAddress: process.env.CONTACT_EMAIL_ADDRESS,
}
```

### 3. **Automatic Link Generation**

Only links with valid URLs are shown - no complex enable/disable logic needed.

## Deployment

### Fly.io Production

```bash
# Uses scripts/setup-profile-secrets.sh
fly secrets set GITHUB_PROFILE_URL=https://github.com/yourusername \
                LINKEDIN_PROFILE_URL=https://linkedin.com/in/yourusername \
                INSTAGRAM_PROFILE_URL=https://instagram.com/yourusername \
                CONTACT_EMAIL_ADDRESS=contact@yoursite.com
```

### Other Platforms

Set the same environment variables in your deployment platform's configuration.

## Benefits of This Approach

| Aspect         | Previous Complex System           | New Simple System                             |
| -------------- | --------------------------------- | --------------------------------------------- |
| **Simplicity** | ❌ Complex enable/disable logic   | ✅ Just URLs - present = shown                |
| **Deployment** | ❌ Multiple variables per service | ✅ One URL per service                        |
| **Validation** | ❌ Complex nested schema          | ✅ Simple URL validation                      |
| **Clarity**    | ❌ Username construction          | ✅ Direct URLs - what you see is what you get |

## Development Workflow

1. **Local development:** Edit `.env.local` with your URLs
2. **Staging:** Commit changes to `.env.staging`
3. **Production:** Run `./scripts/setup-profile-secrets.sh` with real URLs
4. **No restart needed:** Environment changes are picked up automatically

This system is much simpler - just direct URLs with automatic validation!
