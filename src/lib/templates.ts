export interface MindMapTemplate {
  id: string;
  name: string;
  description: string;
  category: "business" | "education" | "personal" | "creative";
  nodes: {
    tempId: string;
    parentTempId: string | null;
    label: string;
    content?: string;
    level: number;
    order: number;
  }[];
}

export const TEMPLATES: MindMapTemplate[] = [
  {
    id: "brainstorm",
    name: "Brainstorming Session",
    description: "Open-ended idea generation with main topic and branches",
    category: "creative",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Main Idea", content: "Your central topic or question", level: 0, order: 0 },
      { tempId: "idea1", parentTempId: "root", label: "Idea 1", content: "First concept to explore", level: 1, order: 0 },
      { tempId: "idea2", parentTempId: "root", label: "Idea 2", content: "Second concept to explore", level: 1, order: 1 },
      { tempId: "idea3", parentTempId: "root", label: "Idea 3", content: "Third concept to explore", level: 1, order: 2 },
      { tempId: "idea4", parentTempId: "root", label: "Idea 4", content: "Fourth concept to explore", level: 1, order: 3 },
    ],
  },
  {
    id: "swot",
    name: "SWOT Analysis",
    description: "Analyze Strengths, Weaknesses, Opportunities, and Threats",
    category: "business",
    nodes: [
      { tempId: "root", parentTempId: null, label: "SWOT Analysis", content: "Strategic planning framework", level: 0, order: 0 },
      { tempId: "strengths", parentTempId: "root", label: "Strengths", content: "Internal positive factors", level: 1, order: 0 },
      { tempId: "s1", parentTempId: "strengths", label: "Strength 1", level: 2, order: 0 },
      { tempId: "s2", parentTempId: "strengths", label: "Strength 2", level: 2, order: 1 },
      { tempId: "weaknesses", parentTempId: "root", label: "Weaknesses", content: "Internal negative factors", level: 1, order: 1 },
      { tempId: "w1", parentTempId: "weaknesses", label: "Weakness 1", level: 2, order: 0 },
      { tempId: "w2", parentTempId: "weaknesses", label: "Weakness 2", level: 2, order: 1 },
      { tempId: "opportunities", parentTempId: "root", label: "Opportunities", content: "External positive factors", level: 1, order: 2 },
      { tempId: "o1", parentTempId: "opportunities", label: "Opportunity 1", level: 2, order: 0 },
      { tempId: "o2", parentTempId: "opportunities", label: "Opportunity 2", level: 2, order: 1 },
      { tempId: "threats", parentTempId: "root", label: "Threats", content: "External negative factors", level: 1, order: 3 },
      { tempId: "t1", parentTempId: "threats", label: "Threat 1", level: 2, order: 0 },
      { tempId: "t2", parentTempId: "threats", label: "Threat 2", level: 2, order: 1 },
    ],
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Capture key points, decisions, and action items from meetings",
    category: "business",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Meeting Title", content: "Date and attendees", level: 0, order: 0 },
      { tempId: "agenda", parentTempId: "root", label: "Agenda", content: "Topics discussed", level: 1, order: 0 },
      { tempId: "a1", parentTempId: "agenda", label: "Topic 1", level: 2, order: 0 },
      { tempId: "a2", parentTempId: "agenda", label: "Topic 2", level: 2, order: 1 },
      { tempId: "decisions", parentTempId: "root", label: "Decisions", content: "Key decisions made", level: 1, order: 1 },
      { tempId: "d1", parentTempId: "decisions", label: "Decision 1", level: 2, order: 0 },
      { tempId: "actions", parentTempId: "root", label: "Action Items", content: "Tasks to complete", level: 1, order: 2 },
      { tempId: "act1", parentTempId: "actions", label: "Action 1", content: "Owner: TBD", level: 2, order: 0 },
      { tempId: "act2", parentTempId: "actions", label: "Action 2", content: "Owner: TBD", level: 2, order: 1 },
      { tempId: "followup", parentTempId: "root", label: "Follow-up", content: "Next steps", level: 1, order: 3 },
    ],
  },
  {
    id: "project-plan",
    name: "Project Planning",
    description: "Plan project phases, milestones, and deliverables",
    category: "business",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Project Name", content: "Project overview", level: 0, order: 0 },
      { tempId: "goals", parentTempId: "root", label: "Goals", content: "What we want to achieve", level: 1, order: 0 },
      { tempId: "g1", parentTempId: "goals", label: "Goal 1", level: 2, order: 0 },
      { tempId: "g2", parentTempId: "goals", label: "Goal 2", level: 2, order: 1 },
      { tempId: "phases", parentTempId: "root", label: "Phases", content: "Project timeline", level: 1, order: 1 },
      { tempId: "p1", parentTempId: "phases", label: "Phase 1: Planning", level: 2, order: 0 },
      { tempId: "p2", parentTempId: "phases", label: "Phase 2: Execution", level: 2, order: 1 },
      { tempId: "p3", parentTempId: "phases", label: "Phase 3: Review", level: 2, order: 2 },
      { tempId: "resources", parentTempId: "root", label: "Resources", content: "Team and tools", level: 1, order: 2 },
      { tempId: "risks", parentTempId: "root", label: "Risks", content: "Potential challenges", level: 1, order: 3 },
    ],
  },
  {
    id: "study-guide",
    name: "Study Guide",
    description: "Organize learning materials and key concepts",
    category: "education",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Subject", content: "Course or topic name", level: 0, order: 0 },
      { tempId: "concepts", parentTempId: "root", label: "Key Concepts", content: "Main ideas to understand", level: 1, order: 0 },
      { tempId: "c1", parentTempId: "concepts", label: "Concept 1", level: 2, order: 0 },
      { tempId: "c2", parentTempId: "concepts", label: "Concept 2", level: 2, order: 1 },
      { tempId: "c3", parentTempId: "concepts", label: "Concept 3", level: 2, order: 2 },
      { tempId: "examples", parentTempId: "root", label: "Examples", content: "Practical applications", level: 1, order: 1 },
      { tempId: "e1", parentTempId: "examples", label: "Example 1", level: 2, order: 0 },
      { tempId: "questions", parentTempId: "root", label: "Review Questions", content: "Test your knowledge", level: 1, order: 2 },
      { tempId: "q1", parentTempId: "questions", label: "Question 1", level: 2, order: 0 },
      { tempId: "resources", parentTempId: "root", label: "Resources", content: "Books, links, videos", level: 1, order: 3 },
    ],
  },
  {
    id: "book-summary",
    name: "Book Summary",
    description: "Summarize key takeaways from a book",
    category: "education",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Book Title", content: "Author name", level: 0, order: 0 },
      { tempId: "overview", parentTempId: "root", label: "Overview", content: "What the book is about", level: 1, order: 0 },
      { tempId: "chapters", parentTempId: "root", label: "Key Chapters", content: "Important sections", level: 1, order: 1 },
      { tempId: "ch1", parentTempId: "chapters", label: "Chapter 1", level: 2, order: 0 },
      { tempId: "ch2", parentTempId: "chapters", label: "Chapter 2", level: 2, order: 1 },
      { tempId: "takeaways", parentTempId: "root", label: "Key Takeaways", content: "Main lessons", level: 1, order: 2 },
      { tempId: "t1", parentTempId: "takeaways", label: "Takeaway 1", level: 2, order: 0 },
      { tempId: "t2", parentTempId: "takeaways", label: "Takeaway 2", level: 2, order: 1 },
      { tempId: "quotes", parentTempId: "root", label: "Notable Quotes", content: "Memorable passages", level: 1, order: 3 },
      { tempId: "actions", parentTempId: "root", label: "Action Items", content: "How to apply learnings", level: 1, order: 4 },
    ],
  },
  {
    id: "content-outline",
    name: "Content Outline",
    description: "Plan blog posts, articles, or video scripts",
    category: "creative",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Content Title", content: "Working title", level: 0, order: 0 },
      { tempId: "hook", parentTempId: "root", label: "Hook", content: "Attention-grabbing intro", level: 1, order: 0 },
      { tempId: "problem", parentTempId: "root", label: "Problem", content: "What issue are we addressing?", level: 1, order: 1 },
      { tempId: "solution", parentTempId: "root", label: "Solution", content: "Main points", level: 1, order: 2 },
      { tempId: "s1", parentTempId: "solution", label: "Point 1", level: 2, order: 0 },
      { tempId: "s2", parentTempId: "solution", label: "Point 2", level: 2, order: 1 },
      { tempId: "s3", parentTempId: "solution", label: "Point 3", level: 2, order: 2 },
      { tempId: "cta", parentTempId: "root", label: "Call to Action", content: "What should readers do?", level: 1, order: 3 },
      { tempId: "seo", parentTempId: "root", label: "SEO Keywords", content: "Target keywords", level: 1, order: 4 },
    ],
  },
  {
    id: "goal-setting",
    name: "Goal Setting",
    description: "Define and break down personal or professional goals",
    category: "personal",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Goal", content: "What do you want to achieve?", level: 0, order: 0 },
      { tempId: "why", parentTempId: "root", label: "Why", content: "Motivation and purpose", level: 1, order: 0 },
      { tempId: "milestones", parentTempId: "root", label: "Milestones", content: "Key checkpoints", level: 1, order: 1 },
      { tempId: "m1", parentTempId: "milestones", label: "Milestone 1", level: 2, order: 0 },
      { tempId: "m2", parentTempId: "milestones", label: "Milestone 2", level: 2, order: 1 },
      { tempId: "m3", parentTempId: "milestones", label: "Milestone 3", level: 2, order: 2 },
      { tempId: "obstacles", parentTempId: "root", label: "Obstacles", content: "Potential challenges", level: 1, order: 2 },
      { tempId: "resources", parentTempId: "root", label: "Resources Needed", content: "Tools, skills, support", level: 1, order: 3 },
      { tempId: "timeline", parentTempId: "root", label: "Timeline", content: "Target completion date", level: 1, order: 4 },
    ],
  },
  {
    id: "decision-making",
    name: "Decision Making",
    description: "Analyze options and make informed decisions",
    category: "personal",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Decision", content: "What are you deciding?", level: 0, order: 0 },
      { tempId: "option1", parentTempId: "root", label: "Option A", content: "First choice", level: 1, order: 0 },
      { tempId: "o1pros", parentTempId: "option1", label: "Pros", level: 2, order: 0 },
      { tempId: "o1cons", parentTempId: "option1", label: "Cons", level: 2, order: 1 },
      { tempId: "option2", parentTempId: "root", label: "Option B", content: "Second choice", level: 1, order: 1 },
      { tempId: "o2pros", parentTempId: "option2", label: "Pros", level: 2, order: 0 },
      { tempId: "o2cons", parentTempId: "option2", label: "Cons", level: 2, order: 1 },
      { tempId: "criteria", parentTempId: "root", label: "Decision Criteria", content: "What matters most?", level: 1, order: 2 },
      { tempId: "recommendation", parentTempId: "root", label: "Recommendation", content: "Best choice and why", level: 1, order: 3 },
    ],
  },
  {
    id: "product-roadmap",
    name: "Product Roadmap",
    description: "Plan product features and releases",
    category: "business",
    nodes: [
      { tempId: "root", parentTempId: null, label: "Product Name", content: "Product vision", level: 0, order: 0 },
      { tempId: "now", parentTempId: "root", label: "Now", content: "Current sprint/quarter", level: 1, order: 0 },
      { tempId: "n1", parentTempId: "now", label: "Feature 1", level: 2, order: 0 },
      { tempId: "n2", parentTempId: "now", label: "Feature 2", level: 2, order: 1 },
      { tempId: "next", parentTempId: "root", label: "Next", content: "Upcoming priorities", level: 1, order: 1 },
      { tempId: "nx1", parentTempId: "next", label: "Feature 3", level: 2, order: 0 },
      { tempId: "nx2", parentTempId: "next", label: "Feature 4", level: 2, order: 1 },
      { tempId: "later", parentTempId: "root", label: "Later", content: "Future considerations", level: 1, order: 2 },
      { tempId: "l1", parentTempId: "later", label: "Feature 5", level: 2, order: 0 },
      { tempId: "backlog", parentTempId: "root", label: "Backlog", content: "Ideas to evaluate", level: 1, order: 3 },
    ],
  },
];

export function getTemplatesByCategory(category: MindMapTemplate["category"]): MindMapTemplate[] {
  return TEMPLATES.filter(t => t.category === category);
}

export function getTemplateById(id: string): MindMapTemplate | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export const TEMPLATE_CATEGORIES = [
  { id: "business", name: "Business", description: "Professional and work-related templates" },
  { id: "education", name: "Education", description: "Learning and study templates" },
  { id: "personal", name: "Personal", description: "Goal setting and decision making" },
  { id: "creative", name: "Creative", description: "Content creation and brainstorming" },
] as const;
