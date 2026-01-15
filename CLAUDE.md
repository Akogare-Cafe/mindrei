# CLAUDE.md - MindRei Project Guidelines

## Project Overview

MindRei is a voice-to-mind-map application that transforms speech into visual mind maps using AI. Built with Next.js 16, React 19, Convex, and Clerk authentication.

## Tech Stack

- **Next.js 16** - App Router with React 19
- **Convex** - Real-time backend and database
- **Clerk** - Authentication
- **OpenAI** - GPT-4o-mini for mind map generation
- **React Flow** - Interactive node-based visualization
- **Tailwind CSS v4** - Styling with custom design tokens
- **Framer Motion** - Animations
- **lucide-react** - Icons (ONLY icon library allowed)

## Design System

### Colors (from `src/lib/design-tokens.ts`)
- **Primary**: Teal (#0d9488 light / #2dd4bf dark)
- **Accent**: Amber/Orange (#f59e0b light / #fbbf24 dark)
- **Background**: Warm off-white (#faf8f5 light / #0c0f0e dark)

### Typography
- **Display Font**: Space Grotesk (headings)
- **Body Font**: Noto Sans (body text)

### Components
Use custom Pixel* components for consistency:
- `PixelCard`, `PixelCardHeader`, `PixelCardTitle`, `PixelCardContent`
- `PixelButton` (variants: default, secondary, outline, ghost, glass)
- `PixelBadge`
- `PixelInput`

### CSS Classes (from `globals.css`)
- `.fantasy-card` - Glass morphism cards
- `.liquid-glass` - Strong glass effect
- `.glass-panel` - Subtle glass effect
- `.teal-glow` / `.orange-glow` - Glow effects
- `.calm-transition` - Smooth 600ms transitions
- `.calm-fade-in` / `.calm-scale-in` - Entry animations
- `.bento-grid` / `.bento-item` - Grid layouts

## Critical Rules

### Icons
- **ONLY** use `lucide-react` icons
- **NEVER** use emojis, unicode symbols, or other icon libraries

### Code Style
- TypeScript for all files
- Do NOT add/remove comments unless explicitly requested
- Follow existing patterns in the codebase

### SEO Requirements
All pages must include:
- Proper `<title>` and meta description
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- Semantic HTML (header, main, section, article, footer)
- Structured data (JSON-LD) where appropriate

### Performance Requirements
- Use Next.js Image component for images
- Implement lazy loading for below-fold content
- Use dynamic imports for heavy components
- Minimize client-side JavaScript

### Mobile Responsiveness
- Mobile-first approach
- Test all breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (min 44x44px)
- Readable font sizes on mobile (min 16px base)

## File Structure

```
src/app/           - Pages (App Router)
src/app/(marketing)/ - Landing, pricing, blog pages
src/components/    - React components
src/components/ui/ - Base UI (shadcn)
src/components/marketing/ - Landing page components
src/hooks/         - Custom React hooks
src/lib/           - Utilities
src/types/         - TypeScript type definitions
convex/            - Backend functions
```

## Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npx convex dev     # Start Convex dev server
npx convex dev --once  # Sync Convex functions once
```

## Before Committing

1. Verify NO emojis or unicode icons
2. Confirm all icons use lucide-react
3. Check TypeScript compiles: `npm run build`
4. Test mobile responsiveness
5. Verify SEO meta tags are present
6. If Convex functions modified: `npx convex dev --once`
