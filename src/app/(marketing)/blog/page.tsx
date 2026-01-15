import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";

export const metadata: Metadata = {
  title: "Blog - MindRei | Tips, Tutorials & Mind Mapping Insights",
  description:
    "Discover mind mapping tips, productivity insights, and tutorials. Learn how to think better, organize ideas, and boost creativity with MindRei.",
  openGraph: {
    title: "Blog - MindRei | Tips, Tutorials & Mind Mapping Insights",
    description:
      "Discover mind mapping tips, productivity insights, and tutorials.",
    url: "https://mindrei.app/blog",
    siteName: "MindRei",
    type: "website",
    images: [
      {
        url: "/og-blog.png",
        width: 1200,
        height: 630,
        alt: "MindRei Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - MindRei | Tips, Tutorials & Mind Mapping Insights",
    description: "Discover mind mapping tips and productivity insights.",
    images: ["/og-blog.png"],
  },
  alternates: {
    canonical: "https://mindrei.app/blog",
  },
};

const blogPosts = [
  {
    slug: "getting-started-with-voice-mind-mapping",
    title: "Getting Started with Voice Mind Mapping",
    excerpt:
      "Learn how to transform your spoken ideas into organized visual maps. A complete beginner's guide to voice-powered mind mapping.",
    category: "Tutorial",
    date: "2026-01-10",
    readTime: "5 min read",
    featured: true,
  },
  {
    slug: "10-mind-mapping-techniques-for-better-brainstorming",
    title: "10 Mind Mapping Techniques for Better Brainstorming",
    excerpt:
      "Discover proven techniques to supercharge your brainstorming sessions and unlock creative thinking with mind maps.",
    category: "Productivity",
    date: "2026-01-08",
    readTime: "8 min read",
    featured: true,
  },
  {
    slug: "how-ai-is-revolutionizing-visual-thinking",
    title: "How AI is Revolutionizing Visual Thinking",
    excerpt:
      "Explore how artificial intelligence is changing the way we capture, organize, and visualize our thoughts.",
    category: "AI & Technology",
    date: "2026-01-05",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "mind-mapping-for-students-study-smarter",
    title: "Mind Mapping for Students: Study Smarter, Not Harder",
    excerpt:
      "How students can use mind maps to improve retention, understand complex topics, and ace their exams.",
    category: "Education",
    date: "2026-01-03",
    readTime: "7 min read",
    featured: false,
  },
  {
    slug: "collaborative-mind-mapping-remote-teams",
    title: "Collaborative Mind Mapping for Remote Teams",
    excerpt:
      "Best practices for using mind maps to improve collaboration and communication in distributed teams.",
    category: "Teamwork",
    date: "2025-12-28",
    readTime: "6 min read",
    featured: false,
  },
  {
    slug: "voice-recognition-tips-better-accuracy",
    title: "Voice Recognition Tips for Better Accuracy",
    excerpt:
      "Optimize your voice input for clearer transcription and more accurate mind map generation.",
    category: "Tips & Tricks",
    date: "2025-12-25",
    readTime: "4 min read",
    featured: false,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "MindRei Blog",
  description: "Tips, tutorials, and insights about mind mapping and visual thinking",
  url: "https://mindrei.app/blog",
  publisher: {
    "@type": "Organization",
    name: "MindRei",
    logo: {
      "@type": "ImageObject",
      url: "https://mindrei.app/logo.png",
    },
  },
};

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured);
  const regularPosts = blogPosts.filter((post) => !post.featured);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <header className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            MindRei Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tips, tutorials, and insights to help you think better and organize your ideas more effectively.
          </p>
        </header>

        {featuredPosts.length > 0 && (
          <section className="mb-16" aria-labelledby="featured-posts">
            <h2 id="featured-posts" className="text-2xl font-bold text-foreground mb-8">
              Featured Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <PixelCard rarity="rare" className="h-full group">
                    <PixelCardContent className="pt-6">
                      <PixelBadge variant="secondary" className="mb-4">
                        {post.category}
                      </PixelBadge>
                      <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary calm-transition">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="all-posts">
          <h2 id="all-posts" className="text-2xl font-bold text-foreground mb-8">
            All Posts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <PixelCard rarity="common" className="h-full group">
                  <PixelCardContent className="pt-6">
                    <PixelBadge variant="outline" className="mb-4">
                      {post.category}
                    </PixelBadge>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary calm-transition">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 calm-transition">
                        Read more
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
