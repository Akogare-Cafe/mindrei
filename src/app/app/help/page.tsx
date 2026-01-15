"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  ArrowLeft,
  Search,
  Book,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Play,
  FileText,
  Zap,
  Brain,
  Mic,
  Share2,
  Download,
  Users,
  Sparkles,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle, PixelCardDescription } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const faqs = [
  {
    category: "Getting Started",
    icon: Play,
    questions: [
      {
        q: "How do I create my first mind map?",
        a: "Click the 'Start Live Session' button in the left panel, then simply start speaking. MindRei will automatically transcribe your voice and create a mind map in real-time. Topics you mention will become nodes on your map.",
      },
      {
        q: "What browsers are supported?",
        a: "MindRei works best on Chrome, Edge, and Safari. For voice recording features, we recommend using Chrome for the best experience with the Web Speech API.",
      },
      {
        q: "Do I need a microphone?",
        a: "Yes, a microphone is required for voice recording. Most laptops have built-in microphones, or you can use external USB microphones or headsets for better audio quality.",
      },
    ],
  },
  {
    category: "Voice Recording",
    icon: Mic,
    questions: [
      {
        q: "Why isn't my voice being recognized?",
        a: "Make sure you've granted microphone permissions in your browser. Check that your microphone is working and selected as the input device. Speaking clearly and at a moderate pace helps improve recognition accuracy.",
      },
      {
        q: "Can I use MindRei in different languages?",
        a: "Currently, MindRei supports English (US and UK), Spanish, French, German, Japanese, and Chinese. You can change your language in Settings > Voice Recording > Language.",
      },
      {
        q: "How do I pause recording without ending the session?",
        a: "Click the pause button during a live session. Your mind map will be preserved, and you can resume recording at any time by clicking the play button.",
      },
    ],
  },
  {
    category: "AI Features",
    icon: Brain,
    questions: [
      {
        q: "How does the AI generate insights?",
        a: "Our AI analyzes the topics you mention and automatically researches them to provide summaries, key points, and related concepts. This helps you explore ideas more deeply as you brainstorm.",
      },
      {
        q: "Can I disable AI insights?",
        a: "Yes, you can toggle AI features in Settings > AI & Insights. You can disable auto-generate insights while still using voice-to-map functionality.",
      },
      {
        q: "Why are some AI features marked as 'Pro'?",
        a: "Advanced AI features like detailed analysis and priority processing are available on our Pro and Team plans. Free users get standard AI insights with all mind maps.",
      },
    ],
  },
  {
    category: "Collaboration",
    icon: Users,
    questions: [
      {
        q: "How do I share a mind map?",
        a: "Open a mind map and click the Share button in the toolbar. You can invite collaborators by email or generate a shareable link. You can set permissions as viewer or editor.",
      },
      {
        q: "Can multiple people edit at the same time?",
        a: "Yes! MindRei supports real-time collaboration. Multiple users can view and edit the same mind map simultaneously, with changes syncing instantly.",
      },
      {
        q: "How do I remove a collaborator?",
        a: "Open the Share dialog for your mind map, find the collaborator in the list, and click the remove button. Only the map owner can manage collaborators.",
      },
    ],
  },
  {
    category: "Export & Import",
    icon: Download,
    questions: [
      {
        q: "What export formats are available?",
        a: "Free users can export to PNG. Pro users can export to PNG, SVG, PDF, and JSON formats. JSON exports can be re-imported to MindRei.",
      },
      {
        q: "Can I import mind maps from other tools?",
        a: "Currently, you can import MindRei JSON exports. We're working on support for other formats like FreeMind and XMind.",
      },
      {
        q: "Where are my exports saved?",
        a: "Exports are downloaded directly to your device's default download folder. The filename includes the mind map title and export date.",
      },
    ],
  },
];

const guides = [
  {
    title: "Quick Start Guide",
    description: "Learn the basics of MindRei in 5 minutes",
    icon: Play,
    time: "5 min",
  },
  {
    title: "Voice Recording Tips",
    description: "Get the best results from voice recognition",
    icon: Mic,
    time: "3 min",
  },
  {
    title: "Collaboration Guide",
    description: "Work together on mind maps in real-time",
    icon: Users,
    time: "4 min",
  },
  {
    title: "AI Features Deep Dive",
    description: "Unlock the power of AI-assisted brainstorming",
    icon: Brain,
    time: "6 min",
  },
];

export default function HelpPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Getting Started");
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  if (!isLoaded || !user) {
    router.push("/");
    return null;
  }

  const handleSendMessage = async () => {
    setIsSending(true);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSending(false);
    setSendSuccess(true);
    setContactForm({ subject: "", message: "" });
    setTimeout(() => setSendSuccess(false), 5000);
  };

  const filteredFaqs = searchQuery
    ? faqs.map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter((category) => category.questions.length > 0)
    : faqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/app">
            <PixelButton variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to App
            </PixelButton>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Hero Section */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              How can we help?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Search our knowledge base or browse frequently asked questions
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <PixelInput
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {guides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <PixelCard className="h-full cursor-pointer hover:border-primary/50 transition-colors">
                  <PixelCardContent className="p-4 text-center">
                    <div className="mx-auto w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <guide.icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-medium text-foreground text-sm mb-1">
                      {guide.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {guide.description}
                    </p>
                    <PixelBadge variant="secondary" className="text-xs">
                      {guide.time} read
                    </PixelBadge>
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-primary" />
                Frequently Asked Questions
              </PixelCardTitle>
              <PixelCardDescription>
                Find answers to common questions
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent className="space-y-2">
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              ) : (
                filteredFaqs.map((category) => (
                  <div key={category.category} className="border border-border/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.category ? null : category.category
                        )
                      }
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <category.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">
                          {category.category}
                        </span>
                        <PixelBadge variant="secondary" className="text-xs">
                          {category.questions.length}
                        </PixelBadge>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform ${
                          expandedCategory === category.category ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {expandedCategory === category.category && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2">
                            {category.questions.map((faq) => (
                              <div
                                key={faq.q}
                                className="border border-border/30 rounded-lg overflow-hidden"
                              >
                                <button
                                  onClick={() =>
                                    setExpandedQuestion(
                                      expandedQuestion === faq.q ? null : faq.q
                                    )
                                  }
                                  className="w-full flex items-center justify-between p-3 hover:bg-muted/20 transition-colors text-left"
                                >
                                  <span className="text-sm font-medium text-foreground pr-4">
                                    {faq.q}
                                  </span>
                                  <ChevronRight
                                    className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
                                      expandedQuestion === faq.q ? "rotate-90" : ""
                                    }`}
                                  />
                                </button>
                                
                                <AnimatePresence>
                                  {expandedQuestion === faq.q && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="overflow-hidden"
                                    >
                                      <p className="px-3 pb-3 text-sm text-muted-foreground">
                                        {faq.a}
                                      </p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </PixelCardContent>
          </PixelCard>

          {/* Contact Support */}
          <PixelCard>
            <PixelCardHeader>
              <PixelCardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Contact Support
              </PixelCardTitle>
              <PixelCardDescription>
                Can't find what you're looking for? Send us a message
              </PixelCardDescription>
            </PixelCardHeader>
            <PixelCardContent>
              {sendSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                    <Check className="w-7 h-7 text-green-500" />
                  </div>
                  <p className="font-medium text-foreground mb-2">Message Sent!</p>
                  <p className="text-sm text-muted-foreground">
                    We'll get back to you within 24 hours
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <PixelInput
                      id="subject"
                      placeholder="What do you need help with?"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      placeholder="Describe your issue or question in detail..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, message: e.target.value })
                      }
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24 hours
                    </p>
                    <PixelButton
                      onClick={handleSendMessage}
                      disabled={!contactForm.subject || !contactForm.message || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Message
                    </PixelButton>
                  </div>
                </div>
              )}
            </PixelCardContent>
          </PixelCard>

          {/* Additional Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PixelCard className="cursor-pointer hover:border-primary/50 transition-colors">
              <PixelCardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Documentation</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Detailed guides and API docs
                </p>
                <PixelButton variant="outline" size="sm">
                  View Docs
                  <ExternalLink className="w-3 h-3 ml-2" />
                </PixelButton>
              </PixelCardContent>
            </PixelCard>

            <PixelCard className="cursor-pointer hover:border-primary/50 transition-colors">
              <PixelCardContent className="p-6 text-center">
                <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Community</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Join our Discord server
                </p>
                <PixelButton variant="outline" size="sm">
                  Join Discord
                  <ExternalLink className="w-3 h-3 ml-2" />
                </PixelButton>
              </PixelCardContent>
            </PixelCard>

            <PixelCard className="cursor-pointer hover:border-primary/50 transition-colors">
              <PixelCardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">Email Us</p>
                <p className="text-sm text-muted-foreground mb-3">
                  support@mindrei.app
                </p>
                <PixelButton variant="outline" size="sm">
                  Send Email
                  <ExternalLink className="w-3 h-3 ml-2" />
                </PixelButton>
              </PixelCardContent>
            </PixelCard>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
