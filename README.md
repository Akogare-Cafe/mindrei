# MindRei - Voice to Mind Map

Transform your voice into beautiful mind maps in real-time. Powered by AI for seamless speech-to-map conversion.

## Features

- **Real-time Voice Recognition** - Speak naturally and watch your words transform into structured content
- **AI-Powered Mind Map Generation** - GPT-4o-mini analyzes your speech and creates hierarchical mind maps
- **Interactive Visualization** - Pan, zoom, and edit your mind maps with React Flow
- **Real-time Sync** - All changes sync instantly with Convex backend
- **User Authentication** - Secure sign-in with Clerk
- **Dark/Light Mode** - Beautiful UI that adapts to your preference

## Tech Stack

- **Next.js 16** - App Router with React 19
- **Convex** - Real-time backend and database
- **Clerk** - Authentication
- **OpenAI** - GPT-4o-mini for mind map generation
- **React Flow** - Interactive node-based visualization
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **lucide-react** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account
- Clerk account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mindrei.git
cd mindrei
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment example:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CONVEX_DEPLOYMENT=your-convex-deployment
NEXT_PUBLIC_CONVEX_URL=your-convex-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
OPENAI_API_KEY=your-openai-key
```

5. Initialize Convex:
```bash
npx convex dev
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
mindrei/
├── convex/              # Convex backend functions
│   ├── schema.ts        # Database schema
│   ├── users.ts         # User management
│   ├── mindMaps.ts      # Mind map CRUD
│   ├── nodes.ts         # Node management
│   ├── edges.ts         # Edge management
│   ├── transcriptions.ts # Transcription tracking
│   └── ai.ts            # AI actions for mind map generation
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   │   ├── providers/   # Context providers
│   │   ├── ui/          # Base UI components (shadcn)
│   │   └── ...          # Feature components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   └── types/           # TypeScript type definitions
└── ...
```

## Usage

1. **Sign In** - Create an account or sign in with your preferred method
2. **Record** - Click the microphone button and start speaking
3. **Generate** - Click "Generate Mind Map" to create a visual map from your speech
4. **Edit** - Click on nodes to edit labels, drag to reposition
5. **Manage** - View, select, and delete your saved mind maps

## Browser Support

Voice recognition requires the Web Speech API, which is supported in:
- Chrome (recommended)
- Edge
- Safari

## License

MIT
