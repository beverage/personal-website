# Personal Website

A modern Next.js personal website featuring an animated lenticular star cluster background and pre-LCARS-style UI components.

## 🚀 Features

- **Animated Star Field**: Beautiful 3D star field animation with multiple variants
- **Pre-LCARS UI Design**: Glassmorphism panels with cyan/blue gradients
- **Component Architecture**: Reusable UI components with Storybook integration
- **TypeScript**: Full type safety throughout the codebase
- **Responsive Design**: Works on desktop and mobile devices
- **Modern Stack**: Next.js 15, React 19, Tailwind CSS

## 🧪 Testing

This project includes comprehensive testing across multiple layers:

- **Unit Tests**: `npm test` - Test individual components and logic
- **Visual Testing**: `npm run storybook` - Interactive component development
- **E2E Tests**: `npx playwright test` - Full user experience testing
- **Performance Tests**: Animation performance and memory usage monitoring

See [TESTING.md](TESTING.md) for detailed testing documentation.

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Start Storybook
npm run storybook

# Build for production
npm run build
```

## 🚀 CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment:

### Pipeline Stages:

1. **🧪 Test**: Unit tests, linting, and Storybook builds
2. **🎭 E2E Test**: Playwright browser testing (on push to main)
3. **🏗️ Build**: Next.js application build
4. **🚀 Deploy**: Automated deployment to Fly.io

### Deployment

- **Triggers**: Push to `main` branch
- **Platform**: Fly.io
- **Requirements**: `PERSONAL_WEBSITE_DEPLOY_TOKEN` secret configured

The pipeline ensures all code is tested before deployment and provides artifacts for debugging.

## 📦 Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **Animation**: Custom Canvas-based star field
- **Testing**: Vitest, React Testing Library, Playwright
- **UI Development**: Storybook
- **Deployment**: Fly.io
- **CI/CD**: GitHub Actions

## 🌟 Star Field Variants

The animated background includes 5 different star field variants:

- `twinkle` - Basic twinkling stars
- `twinkle-compact` - Compact twinkle effect
- `twinkle-pulse` - Pulsing twinkle animation
- `twinkle-glow` - Glowing star effects
- `twinkle-gradient` - Gradient-based effects

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run start           # Start production server

# Testing
npm test                # Run unit tests
npm run test:watch      # Watch mode
npm run test:ui         # Visual test runner
npm run test:coverage   # Coverage report

# Storybook
npm run storybook       # Start Storybook
npm run build-storybook # Build static Storybook

# E2E Testing
npx playwright test     # Run E2E tests
npx playwright test --ui # Run with UI
```

## 🔗 Links

- **Live Site**: [Your website URL]
- **Storybook**: [Storybook deployment URL]
- **GitHub**: [Repository URL]

---

Built with ❤️ and lots of ☕
