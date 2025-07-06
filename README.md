# 🌐 Personal Website

A modern personal website built with Next.js 15 and TypeScript, featuring component development with Storybook.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation
```bash
npm install
```

## 🏃‍♂️ Development

### Running the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website in your browser. The page will automatically reload when you make changes.

### Other Available Commands
```bash
# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## 📚 Storybook

This project includes Storybook for component development and testing.

### Running Storybook
```bash
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to view the Storybook interface. This allows you to:
- Browse and interact with components in isolation
- Test different component states and props
- View component documentation
- Run accessibility tests

### Building Storybook
```bash
npm run build-storybook
```

This creates a static build of your Storybook in the `storybook-static` directory.

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Homepage
│   └── variants/       # Page variants
├── stories/            # Storybook stories and components
│   ├── Button.tsx      # Button component
│   ├── Header.tsx      # Header component
│   └── Page.tsx        # Page component
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Component Development**: Storybook
- **Testing**: Vitest with Browser mode
- **Linting**: ESLint
- **Icons**: Lucide React

## 🧪 Testing

The project includes Vitest for testing with browser mode support:

```bash
npm run test
```

## 🚢 Deployment

The project is configured for deployment on Fly.io (see `fly.toml` and `Dockerfile`).

For Vercel deployment, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
