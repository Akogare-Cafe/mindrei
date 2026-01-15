"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager",
    company: "TechCorp",
    content: "MindRei has completely transformed how I run brainstorming sessions. I just speak my ideas and watch them organize themselves into beautiful mind maps.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    role: "UX Designer",
    company: "DesignStudio",
    content: "The AI is incredibly smart at understanding context and relationships. It saves me hours of manual organization every week.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Content Strategist",
    company: "MediaGroup",
    content: "I use MindRei for content planning and it has become indispensable. The voice-to-map feature is like having a personal assistant.",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Startup Founder",
    company: "InnovateLab",
    content: "Perfect for capturing ideas on the go. I can brainstorm while walking and have a complete mind map ready when I get back to my desk.",
    rating: 5,
  },
  {
    name: "Lisa Thompson",
    role: "Teacher",
    company: "Lincoln High",
    content: "My students love it! It makes lesson planning so much more engaging and helps visual learners understand complex topics.",
    rating: 5,
  },
  {
    name: "Alex Patel",
    role: "Consultant",
    company: "StrategyFirst",
    content: "The real-time sync feature is amazing. I can collaborate with clients and see their ideas appear instantly on the mind map.",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-primary mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground"
          >
            Loved by Thinkers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            See what our users have to say about their experience with MindRei.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <PixelCard rarity="common" className="h-full">
                <PixelCardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  
                  <div className="relative mb-4">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/10" />
                    <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                      {testimonial.content}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {testimonial.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </p>
                    </div>
                  </div>
                </PixelCardContent>
              </PixelCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
