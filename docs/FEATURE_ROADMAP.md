# MindRei Feature Roadmap - 2025

## Feature Gap Analysis

### What Competitors Have That We Don't

#### Critical Gaps (Blocking competitive advantage)
1. **Document Input** (Mapify, Notta, XMind)
   - PDF to mind map
   - Text paste to mind map
   - URL/webpage summarization
   - YouTube video transcription

2. **Mobile Apps** (All major competitors)
   - iOS native app
   - Android native app
   - Progressive Web App (PWA)

3. **Multi-language Support** (Mapify: 30+, Notta: 58)
   - Voice recognition in multiple languages
   - Translation capabilities
   - Localized UI

4. **Advanced Export** (XMind, MindMeister)
   - Excel/CSV export
   - Word/Markdown export
   - PowerPoint/Slides export
   - SVG/vector formats

#### Important Gaps (Limiting growth)
5. **Meeting Integrations** (None have this well)
   - Zoom plugin
   - Google Meet extension
   - Microsoft Teams app
   - Slack bot

6. **Offline Mode** (XMind, MindNode)
   - Offline voice processing
   - Local storage
   - Sync when online

7. **Templates Library** (Miro, XMind, Ayoa)
   - Pre-built mind map templates
   - Industry-specific templates
   - Custom template creation

8. **Version History** (XMind: 30 days, MindMeister)
   - Track changes over time
   - Restore previous versions
   - Compare versions

### What We Have That Competitors Don't

#### Unique Advantages (Defend these)
1. ✅ **Real-time Voice Processing** - ONLY us
2. ✅ **Live Collaborative Sessions** - Real-time brainstorming
3. ✅ **AI Topic Insights** - Automated research per node
4. ✅ **Similar Topic Suggestions** - AI branching recommendations
5. ✅ **Node Expansion AI** - Smart subtopic generation

---

## Proposed New Features

### Tier 1: Critical (0-3 months) - Close Competitive Gaps

#### 1. Document Input System
**Impact:** 🔥🔥🔥 HIGH - Compete with Mapify's core feature  
**Effort:** Medium (2-3 weeks)  
**Priority:** P0

**Features:**
- Paste text → AI generates mind map
- Upload PDF → Extract text → Generate map
- Enter URL → Scrape webpage → Generate map
- Drag & drop file support

**Technical Approach:**
- Add file upload to Convex
- Use PDF parsing library (pdf-parse)
- Web scraping with Cheerio/Puppeteer
- Reuse existing AI generation logic

**User Flow:**
```
1. Click "Import Document" button
2. Choose: Paste Text | Upload File | Enter URL
3. AI processes and generates mind map
4. User can edit/refine the generated map
```

---

#### 2. YouTube Video to Mind Map
**Impact:** 🔥🔥🔥 HIGH - Mapify's killer feature  
**Effort:** Medium (2 weeks)  
**Priority:** P0

**Features:**
- Enter YouTube URL
- Extract video transcript (YouTube API)
- AI summarizes into mind map
- Include timestamps for key points
- Click node → jump to video timestamp

**Technical Approach:**
- YouTube Data API v3 for transcripts
- Fallback to youtube-transcript-api
- Parse timestamps and content
- Generate mind map with time markers

**User Flow:**
```
1. Click "Import YouTube Video"
2. Paste YouTube URL
3. AI extracts transcript and generates map
4. Nodes show timestamps
5. Click timestamp → opens video at that point
```

---

#### 3. Progressive Web App (PWA)
**Impact:** 🔥🔥 MEDIUM-HIGH - Mobile accessibility  
**Effort:** Low (1 week)  
**Priority:** P0

**Features:**
- Install as app on mobile/desktop
- Offline capability (view saved maps)
- Push notifications
- App-like experience

**Technical Approach:**
- Add service worker
- Configure next-pwa
- Add manifest.json
- Implement offline caching strategy

---

#### 4. Enhanced Export Options
**Impact:** 🔥🔥 MEDIUM-HIGH - Professional use cases  
**Effort:** Medium (2 weeks)  
**Priority:** P1

**Features:**
- Export to Markdown (with hierarchy)
- Export to CSV/Excel (tabular format)
- Export to SVG (vector graphics)
- Export to Outline format (nested bullets)
- Copy as formatted text

**Technical Approach:**
- Create export utilities for each format
- Use libraries: xlsx, marked, svg-export
- Add download buttons to UI

---

### Tier 2: Important (3-6 months) - Differentiation

#### 5. Meeting Integration Suite
**Impact:** 🔥🔥🔥 HIGH - Unique positioning  
**Effort:** High (4-6 weeks)  
**Priority:** P1

**Features:**
- **Zoom Plugin:** Auto-join meetings, live transcription
- **Google Meet Extension:** Chrome extension for Meet
- **Microsoft Teams App:** Teams integration
- **Slack Bot:** Quick voice notes in Slack

**Technical Approach:**
- Zoom Apps SDK
- Chrome Extension Manifest V3
- Microsoft Teams Toolkit
- Slack Bolt framework

**Unique Value:**
- Only tool with real-time voice during meetings
- Auto-generate meeting notes as mind maps
- Share maps instantly with team

---

#### 6. Multi-language Voice Support
**Impact:** 🔥🔥 MEDIUM-HIGH - Global expansion  
**Effort:** Medium (3 weeks)  
**Priority:** P1

**Features:**
- Support 10+ languages initially
- Language auto-detection
- Translation of generated maps
- Localized UI

**Languages Priority:**
1. Spanish (559M speakers)
2. Mandarin Chinese (1.1B speakers)
3. French (280M speakers)
4. German (134M speakers)
5. Japanese (125M speakers)

**Technical Approach:**
- Web Speech API supports multiple languages
- Add language selector
- Use Google Translate API for translations
- i18n for UI localization

---

#### 7. Template Library
**Impact:** 🔥 MEDIUM - Faster onboarding  
**Effort:** Medium (2 weeks)  
**Priority:** P2

**Features:**
- Pre-built templates by use case
- Industry-specific templates
- Save custom templates
- Share templates with team

**Template Categories:**
- Project Planning
- Meeting Notes
- Content Outline
- Study Guide
- SWOT Analysis
- User Research
- Product Roadmap
- Brainstorming Session

---

#### 8. Advanced Collaboration Features
**Impact:** 🔥🔥 MEDIUM-HIGH - Team use cases  
**Effort:** High (4 weeks)  
**Priority:** P2

**Features:**
- Comments on nodes
- @mentions in comments
- Presence indicators (who's viewing)
- Cursor tracking (see others' cursors)
- Change notifications
- Activity feed

**Technical Approach:**
- Extend Convex schema for comments
- Real-time presence with Convex
- WebSocket for cursor positions
- Notification system

---

### Tier 3: Nice-to-Have (6-12 months) - Polish & Scale

#### 9. AI Enhancements
**Impact:** 🔥🔥 MEDIUM-HIGH - Better AI quality  
**Effort:** Medium (3 weeks)  
**Priority:** P2

**Features:**
- **Smart Clustering:** Auto-group related topics
- **Duplicate Detection:** Warn about similar nodes
- **Topic Recommendations:** Suggest missing topics
- **Auto-tagging:** AI-generated tags per node
- **Sentiment Analysis:** Detect tone/sentiment
- **Action Item Extraction:** Find tasks automatically

---

#### 10. Version History & Time Travel
**Impact:** 🔥 MEDIUM - Professional feature  
**Effort:** Medium (2 weeks)  
**Priority:** P3

**Features:**
- Auto-save versions every 5 minutes
- Manual snapshots
- Compare versions side-by-side
- Restore to previous version
- 30-day history (Pro), 7-day (Free)

**Technical Approach:**
- Store snapshots in Convex
- Diff algorithm for changes
- UI for version browser

---

#### 11. Mobile Native Apps
**Impact:** 🔥🔥🔥 HIGH - Market expansion  
**Effort:** Very High (8-12 weeks)  
**Priority:** P1 (after PWA)

**Features:**
- iOS app (Swift/SwiftUI)
- Android app (Kotlin/Jetpack Compose)
- Native voice recording
- Offline mode
- Push notifications
- App Store optimization

**Technical Approach:**
- React Native (faster) OR Native (better UX)
- Share Convex backend
- Platform-specific voice APIs

---

#### 12. API & Integrations
**Impact:** 🔥 MEDIUM - Developer ecosystem  
**Effort:** High (4 weeks)  
**Priority:** P3

**Features:**
- REST API for mind map CRUD
- Webhooks for events
- Zapier integration
- Make.com integration
- Notion plugin
- Obsidian plugin

---

#### 13. Offline Mode
**Impact:** 🔥 MEDIUM - Reliability  
**Effort:** High (4 weeks)  
**Priority:** P3

**Features:**
- Download maps for offline use
- Offline voice processing (Web Speech API works offline)
- Local storage with IndexedDB
- Sync when back online
- Conflict resolution

---

#### 14. Advanced Search & Filters
**Impact:** 🔥 MEDIUM - Power users  
**Effort:** Low (1 week)  
**Priority:** P3

**Features:**
- Search across all mind maps
- Filter by date, tags, collaborators
- Saved searches
- Search within a mind map
- Fuzzy search

---

## Existing Features to Improve

### 1. Voice Recognition Quality
**Current State:** Uses Web Speech API (browser-dependent)  
**Improvements:**
- Add custom wake word ("Hey MindRei")
- Voice commands ("Add child node", "Delete this", "Expand topic")
- Speaker diarization (label who said what)
- Noise cancellation
- Punctuation auto-detection

**Technical Approach:**
- Integrate Deepgram or AssemblyAI for better accuracy
- Add voice command parser
- Use WebRTC for noise reduction

---

### 2. AI Topic Insights
**Current State:** Basic web search for context  
**Improvements:**
- Show source citations
- Multiple perspectives (pros/cons)
- Related concepts graph
- Trending information
- Academic sources option
- Fact-checking indicators

**Technical Approach:**
- Use Perplexity API or Tavily for better search
- Add source tracking
- Implement citation formatting

---

### 3. Similar Topic Suggestions
**Current State:** Basic AI suggestions (just implemented)  
**Improvements:**
- Show confidence scores
- Explain why topics are similar
- Category-based suggestions (deeper dive, adjacent, alternative)
- Learn from user selections
- Suggest connections between existing nodes

**Technical Approach:**
- Enhance AI prompt with reasoning
- Track user acceptance rate
- Use embeddings for similarity

---

### 4. Node Editing & Formatting
**Current State:** Basic text editing  
**Improvements:**
- Rich text formatting (bold, italic, links)
- Emoji picker
- Color coding by category
- Icons per node
- Custom node shapes
- Node templates
- Markdown support

---

### 5. Visualization & Layout
**Current State:** Auto-layout with React Flow  
**Improvements:**
- Multiple layout algorithms (radial, tree, force-directed)
- Manual positioning with snap-to-grid
- Zoom to fit
- Focus mode (show only selected branch)
- Minimap for navigation
- Fisheye zoom
- Dark/light theme per map

---

### 6. Collaboration UX
**Current State:** Basic real-time sync  
**Improvements:**
- Show who's editing what
- Conflict resolution UI
- Undo/redo per user
- Collaborative cursor
- Voice chat during session
- Video chat integration

---

### 7. Onboarding & Education
**Current State:** Minimal onboarding  
**Improvements:**
- Interactive tutorial
- Sample mind maps
- Video walkthroughs
- Tooltips for features
- Keyboard shortcuts guide
- Use case examples

---

### 8. Performance Optimization
**Current State:** Works well for small maps  
**Improvements:**
- Lazy loading for large maps (>100 nodes)
- Virtual scrolling
- WebGL rendering for huge maps
- Optimize AI calls (caching)
- Reduce bundle size
- Faster initial load

---

## Feature Prioritization Matrix

| Feature | Impact | Effort | Priority | Timeline |
|---------|--------|--------|----------|----------|
| **Document Input** | HIGH | Medium | P0 | Week 1-2 |
| **YouTube Import** | HIGH | Medium | P0 | Week 3-4 |
| **PWA** | MED-HIGH | Low | P0 | Week 5 |
| **Enhanced Export** | MED-HIGH | Medium | P1 | Week 6-7 |
| **Multi-language** | MED-HIGH | Medium | P1 | Month 2 |
| **Meeting Integrations** | HIGH | High | P1 | Month 3-4 |
| **Template Library** | MEDIUM | Medium | P2 | Month 3 |
| **Advanced Collab** | MED-HIGH | High | P2 | Month 4-5 |
| **AI Enhancements** | MED-HIGH | Medium | P2 | Month 5 |
| **Version History** | MEDIUM | Medium | P3 | Month 6 |
| **Mobile Apps** | HIGH | V.High | P1 | Month 6-9 |
| **API/Integrations** | MEDIUM | High | P3 | Month 9-10 |
| **Offline Mode** | MEDIUM | High | P3 | Month 10-11 |
| **Advanced Search** | MEDIUM | Low | P3 | Month 12 |

---

## Implementation Plan - Next 3 Months

### Month 1: Close Critical Gaps

**Week 1-2: Document Input System**
- [ ] Add file upload UI component
- [ ] Implement PDF parsing (pdf-parse)
- [ ] Add text paste modal
- [ ] Create URL scraper (Cheerio)
- [ ] Connect to existing AI generation
- [ ] Add loading states
- [ ] Test with various document types

**Week 3-4: YouTube Video Import**
- [ ] YouTube API integration
- [ ] Transcript extraction
- [ ] Timestamp parsing
- [ ] UI for YouTube URL input
- [ ] Generate mind map from transcript
- [ ] Add timestamp links to nodes
- [ ] Test with various video types

**Week 5: Progressive Web App**
- [ ] Install next-pwa
- [ ] Configure service worker
- [ ] Add manifest.json
- [ ] Test install flow
- [ ] Add offline fallback page
- [ ] Test on iOS/Android

**Week 6-7: Enhanced Export**
- [ ] Markdown export
- [ ] CSV/Excel export
- [ ] SVG export
- [ ] Outline format export
- [ ] Add export menu UI
- [ ] Test all formats

### Month 2: Differentiation Features

**Week 8-10: Multi-language Support**
- [ ] Add language selector
- [ ] Implement language detection
- [ ] Add translation API
- [ ] Localize UI (i18n)
- [ ] Test with 5 languages
- [ ] Update documentation

**Week 11-12: Template Library**
- [ ] Design template schema
- [ ] Create 10 initial templates
- [ ] Build template browser UI
- [ ] Add template preview
- [ ] Implement "Use Template"
- [ ] Add custom template saving

### Month 3: Advanced Features

**Week 13-16: Meeting Integrations (Phase 1)**
- [ ] Chrome extension for Google Meet
- [ ] Basic transcription during meetings
- [ ] Auto-generate meeting notes
- [ ] Share map after meeting
- [ ] Test with real meetings
- [ ] Zoom plugin (if time permits)

---

## Quick Wins (Can implement in 1-2 days each)

1. **Keyboard Shortcuts** - Power user feature
2. **Dark Mode Toggle** - User preference
3. **Node Icons** - Visual categorization
4. **Duplicate Map** - Quick starting point
5. **Search Within Map** - Find nodes quickly
6. **Undo/Redo** - Basic editing feature
7. **Auto-save Indicator** - User confidence
8. **Node Count Display** - Map statistics
9. **Share Link** - Easy collaboration
10. **Print View** - Professional output

---

## Metrics to Track

### Feature Adoption
- % of users using document import
- % of users using YouTube import
- % of users installing PWA
- Most popular export format
- Most used template

### Engagement
- Average nodes per map
- Average session duration
- Voice vs. manual input ratio
- Collaboration session frequency
- Feature discovery rate

### Conversion
- Free to paid conversion by feature usage
- Feature correlation with retention
- Most valuable features for paid users

---

## Competitive Feature Parity Goals

### 3 Months
- ✅ Match Mapify on input formats (text, PDF, URL, YouTube)
- ✅ Match XMind on export options
- ✅ Exceed all on voice quality (real-time advantage)

### 6 Months
- ✅ Match MindMeister on collaboration
- ✅ Exceed all on meeting integrations (unique)
- ✅ Match Notta on multi-language support

### 12 Months
- ✅ Match all major competitors on core features
- ✅ Lead market on voice-first experience
- ✅ Unique position: "Voice-first collaborative mind mapping"

---

*Last Updated: January 15, 2025*
