# AGENTS.md - Guidelines for AI Coding Agents

## Icon Rules

### USE ONLY lucide-react

All icons in this project MUST come from `lucide-react`.

```tsx
import { IconName } from "lucide-react";
<IconName className="w-4 h-4" />
```

### PROHIBITED

- System emojis
- Unicode symbols
- HTML entities
- Other icon libraries

## Code Guidelines

### Comments
- Do NOT add comments unless explicitly requested
- Do NOT delete existing comments unless explicitly requested

### Style
- TypeScript for all files
- Use custom Pixel* components (PixelCard, PixelButton, PixelBadge, PixelInput)

## Tech Stack

- **Next.js 16** - App Router
- **React 19** - UI
- **Tailwind CSS v4** - Styling
- **Radix UI** - Headless components
- **lucide-react** - Icons
- **Convex** - Backend/Database
- **Clerk** - Authentication
- **Framer Motion** - Animations
- **React Flow** - Mind map visualization
- **OpenAI** - AI-powered mind map generation

## Design System

### Colors (from `src/lib/design-tokens.ts`)
- **Primary**: Teal (#0d9488 light / #2dd4bf dark)
- **Accent**: Amber/Orange (#f59e0b light / #fbbf24 dark)
- **Background**: Warm off-white (#faf8f5 light / #0c0f0e dark)

### Typography
- **Display Font**: Space Grotesk (headings)
- **Body Font**: Noto Sans (body text)

### CSS Classes (from globals.css)
- `.fantasy-card` - Glass morphism cards
- `.liquid-glass` - Strong glass effect
- `.glass-panel` - Subtle glass effect
- `.teal-glow` / `.orange-glow` - Glow effects
- `.calm-transition` - Smooth 600ms transitions
- `.calm-fade-in` / `.calm-scale-in` - Entry animations
- `.bento-grid` / `.bento-item` - Grid layouts

## SEO Requirements

All pages MUST include:
- Proper `<title>` via Next.js metadata export
- Meta description (150-160 characters)
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags (twitter:card, twitter:title, twitter:description)
- Semantic HTML structure (header, main, section, article, footer)
- JSON-LD structured data where appropriate

## Performance Requirements

- Use Next.js `<Image>` component for all images
- Implement lazy loading for below-fold content
- Use `dynamic()` imports for heavy components
- Minimize client-side JavaScript
- Prefer Server Components over Client Components

## Mobile Responsiveness

- Mobile-first CSS approach
- Test all breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly tap targets (minimum 44x44px)
- Readable font sizes on mobile (minimum 16px base)
- Use responsive Tailwind classes: `text-sm md:text-base lg:text-lg`

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

## Convex Backend

When modifying files in the `convex/` folder, sync the functions:

```bash
npx convex dev --once
```

## Before Committing

1. Verify NO emojis or unicode icons
2. Confirm all icons use lucide-react
3. Check TypeScript compiles without errors
4. Test mobile responsiveness
5. Verify SEO meta tags are present
6. If Convex functions were modified, run `npx convex dev --once`
