import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2, Twitter, Linkedin } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  author: {
    name: string;
    role: string;
  };
}

const blogPosts: BlogPost[] = [
  {
    slug: "getting-started-with-voice-mind-mapping",
    title: "Getting Started with Voice Mind Mapping",
    excerpt:
      "Learn how to transform your spoken ideas into organized visual maps. A complete beginner's guide to voice-powered mind mapping.",
    content: `
Voice mind mapping is revolutionizing how we capture and organize our thoughts. Instead of typing or drawing, you simply speak your ideas and watch them transform into beautiful, structured mind maps.

## Why Voice Mind Mapping?

Traditional mind mapping requires you to stop and think about structure while you're creating. Voice mind mapping removes this friction entirely. You can:

- **Capture ideas faster** - Speaking is 3x faster than typing
- **Stay in flow** - No interruptions to your creative process
- **Think more naturally** - Our brains process speech more intuitively than text

## Getting Started with MindRei

### Step 1: Set Up Your Environment

Find a quiet space where you can speak clearly. While MindRei's AI is excellent at filtering background noise, a quieter environment will give you the best results.

### Step 2: Start with a Central Topic

Click the microphone button and state your main topic clearly. For example: "Today I want to brainstorm ideas for my new mobile app."

### Step 3: Branch Out Naturally

As you continue speaking, mention subtopics and related ideas. MindRei's AI will automatically identify relationships and create appropriate branches.

### Step 4: Review and Refine

After your brainstorming session, review the generated mind map. You can click on any node to edit labels, drag nodes to reposition them, or add new connections manually.

## Pro Tips for Better Results

1. **Speak in complete thoughts** - This helps the AI understand context better
2. **Use transition words** - Phrases like "related to this" or "another aspect is" help create clear connections
3. **Pause between major topics** - This gives the AI clear signals about topic boundaries
4. **Review and iterate** - Your first map is a starting point, not the final product

## Conclusion

Voice mind mapping with MindRei opens up new possibilities for capturing and organizing your thoughts. Start with simple brainstorming sessions and gradually explore more complex use cases as you become comfortable with the tool.
    `,
    category: "Tutorial",
    date: "2026-01-10",
    readTime: "5 min read",
    author: {
      name: "Sarah Chen",
      role: "Product Lead",
    },
  },
  {
    slug: "10-mind-mapping-techniques-for-better-brainstorming",
    title: "10 Mind Mapping Techniques for Better Brainstorming",
    excerpt:
      "Discover proven techniques to supercharge your brainstorming sessions and unlock creative thinking with mind maps.",
    content: `
Mind mapping is more than just drawing bubbles and lines. When done right, it becomes a powerful tool for unlocking creativity and solving complex problems. Here are 10 techniques to elevate your brainstorming sessions.

## 1. The Radial Burst

Start with your central idea and create branches in all directions simultaneously. Don't worry about organization initially - just let ideas flow freely.

## 2. Color Coding

Assign different colors to different categories or themes. This visual distinction helps your brain process and remember information more effectively.

## 3. The Six Thinking Hats

Apply Edward de Bono's framework by creating six branches, each representing a different thinking mode: facts, emotions, caution, benefits, creativity, and process.

## 4. Question Branching

Turn each branch into a question. Instead of "Marketing," write "How can we reach our target audience?" This prompts deeper thinking.

## 5. Time-Boxing

Set a timer for 5-10 minutes and generate as many ideas as possible. The time pressure often leads to more creative, uninhibited thinking.

## 6. Reverse Brainstorming

Instead of asking "How can we solve this problem?", ask "How can we make this problem worse?" Then reverse those ideas for solutions.

## 7. SCAMPER Method

Use the SCAMPER framework (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse) as branches to systematically explore possibilities.

## 8. Mind Map Merging

Create individual mind maps first, then combine them. This works great for team brainstorming where everyone contributes their perspective.

## 9. The 5 Whys

For each major branch, ask "Why?" five times to dig deeper into root causes and underlying assumptions.

## 10. Visual Anchors

Add small sketches or icons to key nodes. Visual elements create stronger memory associations and make your map more engaging.

## Putting It Into Practice

Start with one or two techniques that resonate with you. As you become comfortable, gradually incorporate others. The key is consistency - regular practice will make these techniques second nature.
    `,
    category: "Productivity",
    date: "2026-01-08",
    readTime: "8 min read",
    author: {
      name: "Marcus Johnson",
      role: "Content Strategist",
    },
  },
  {
    slug: "how-ai-is-revolutionizing-visual-thinking",
    title: "How AI is Revolutionizing Visual Thinking",
    excerpt:
      "Explore how artificial intelligence is changing the way we capture, organize, and visualize our thoughts.",
    content: `
Artificial intelligence is transforming every aspect of how we work and think. Visual thinking tools are no exception. Let's explore how AI is revolutionizing the way we capture and organize our ideas.

## The Evolution of Mind Mapping

Traditional mind mapping required manual effort at every step - from identifying key concepts to drawing connections. AI changes this fundamentally by automating the cognitive heavy lifting.

## Natural Language Understanding

Modern AI can understand context, identify key concepts, and recognize relationships between ideas. When you speak or type naturally, AI can extract the essential structure and create meaningful visualizations.

## Real-Time Processing

Unlike traditional tools that require you to stop and organize, AI-powered tools work in real-time. As you speak, your ideas are instantly transformed into visual structures.

## Intelligent Suggestions

AI doesn't just transcribe - it suggests. Based on your content, it can recommend related topics, identify gaps in your thinking, and propose alternative structures.

## The Future of Visual Thinking

We're just scratching the surface. Future developments will bring even more sophisticated understanding, personalized learning from your thinking patterns, and seamless integration with other knowledge tools.

## Embracing AI-Assisted Thinking

The goal isn't to replace human creativity but to augment it. AI handles the mechanical aspects of organization, freeing you to focus on what humans do best - creative thinking and insight generation.
    `,
    category: "AI & Technology",
    date: "2026-01-05",
    readTime: "6 min read",
    author: {
      name: "Alex Patel",
      role: "AI Research Lead",
    },
  },
];

function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found - MindRei Blog",
    };
  }

  return {
    title: `${post.title} - MindRei Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://mindrei.app/blog/${post.slug}`,
      siteName: "MindRei",
      type: "article",
      publishedTime: post.date,
      authors: [post.author.name],
      images: [
        {
          url: `/og-blog-${post.slug}.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`/og-blog-${post.slug}.png`],
    },
    alternates: {
      canonical: `https://mindrei.app/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "MindRei",
      logo: {
        "@type": "ImageObject",
        url: "https://mindrei.app/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://mindrei.app/blog/${post.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <header className="mb-12">
          <Link href="/blog">
            <PixelButton variant="ghost" size="sm" className="mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </PixelButton>
          </Link>

          <PixelBadge variant="secondary" className="mb-4">
            {post.category}
          </PixelBadge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {post.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground pb-8 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {post.author.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <p className="font-medium text-foreground">{post.author.name}</p>
                <p className="text-xs">{post.author.role}</p>
              </div>
            </div>

            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
          {post.content.split("\n").map((paragraph, index) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={index} className="text-2xl font-bold mt-10 mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3 key={index} className="text-xl font-semibold mt-8 mb-3">
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }
            if (paragraph.startsWith("- **")) {
              const match = paragraph.match(/- \*\*(.+?)\*\* - (.+)/);
              if (match) {
                return (
                  <li key={index} className="ml-6 mb-2">
                    <strong>{match[1]}</strong> - {match[2]}
                  </li>
                );
              }
            }
            if (paragraph.startsWith("1. ") || paragraph.match(/^\d+\. /)) {
              return (
                <li key={index} className="ml-6 mb-2">
                  {paragraph.replace(/^\d+\. /, "")}
                </li>
              );
            }
            if (paragraph.trim()) {
              return (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              );
            }
            return null;
          })}
        </div>

        <footer className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Share this article:</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://mindrei.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary calm-transition"
                aria-label="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://mindrei.app/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary calm-transition"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}
