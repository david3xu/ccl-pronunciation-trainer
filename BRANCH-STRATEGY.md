# Branch Strategy

## Repository Structure

This repository maintains **two parallel development tracks** for different use cases and deployment scenarios.

---

## Primary Branches

### 📗 `pte` Branch (Production - Vanilla JS)

**Status:** ✅ Production Ready (v2.5.4)

**Technology Stack:**
- Vanilla JavaScript (ES6+)
- Event-driven architecture with EventBus
- Configuration-driven design (Config.js)
- Python HTTP server (port 3001)
- Service Worker (offline PWA)

**Features:**
- ✅ **14 Vocabulary Books** - 13,500+ terms with IPA
- ✅ **4 Practice Modes** - 3,931 sentences/questions
  - RS (Repeat Sentence): 620 sentences
  - RS Segments: 1,424 thought groups
  - ASQ (Answer Short Question): 692 questions
  - WFD (Write From Dictation): 1,195 sentences
- ✅ **Browser TTS** - Free Web Speech API
- ✅ **Settings Module** - 8 settings with validation
- ✅ **Offline Support** - Full PWA functionality
- ✅ **Zero Dependencies** - No external APIs needed

**Recent Updates (November 2025):**
- Added PTE RS Core Vocabulary (773 terms)
- Fixed 14 IPA pronunciation errors
- Corrected 12 spelling errors
- Cleaned up documentation (removed 4,729 lines)
- Archived investigations to docs/archive/

**Use Cases:**
- Quick deployment (no build step)
- Offline-first applications
- Zero-cost hosting (static files)
- Simple maintenance
- No API keys required

**Deployment:**
```bash
npm run data:pte  # Process data
npm run dev       # Development server
# OR deploy dist/ folder to any static host
```

---

### 🚀 `claude/incomplete-description-011CV35Zb4tySmnoS5mf2NyQ` (Future - React + AI)

**Status:** ⚠️ Experimental (v3.0.0 - Work in Progress)

**Technology Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Vitest (testing)
- Supabase (backend)
- AWS Polly (premium TTS)
- Google Gemini (AI features)

**Features:**
- 🤖 **AI Tutor Chat** - Google Gemini conversational help (FREE)
- 🎯 **AI Recommendations** - Personalized learning paths (FREE)
- 🔊 **Premium TTS** - AWS Polly 18 neural voices (~$10/mo)
- ☁️ **Cloud Sync** - Supabase authentication + storage
- 📊 **Analytics** - Study tracking and progress
- 🧠 **Spaced Repetition** - Mastery-based learning

**Missing from v3.0:**
- ❌ PTE RS Core Vocabulary (773 terms)
- ❌ RS Segments practice mode (1,424 items)
- ❌ Recent IPA and spelling fixes
- ❌ Documentation cleanup

**Dependencies:**
- Google Gemini API (FREE tier: 1,500 requests/day)
- AWS Polly API (PAID: ~$16 per 1M characters)
- Supabase account (FREE tier: 500MB storage)

**Use Cases:**
- Advanced learning features
- Multi-device sync needed
- AI-powered assistance
- Premium voice quality
- Analytics and tracking

**Deployment:**
```bash
npm install           # Install dependencies
npm run build         # Vite build
# Deploy to Vercel/Netlify with .env variables
```

**Required Environment Variables:**
```env
VITE_GEMINI_API_KEY=...        # Google Gemini (free)
VITE_AWS_ACCESS_KEY_ID=...     # AWS Polly (paid)
VITE_AWS_SECRET_ACCESS_KEY=... # AWS Polly (paid)
VITE_SUPABASE_URL=...          # Supabase (free tier)
VITE_SUPABASE_ANON_KEY=...     # Supabase (free tier)
```

---

## Decision Matrix

### Choose `pte` branch if:
- ✅ You want zero-cost deployment
- ✅ No API keys or external services needed
- ✅ Offline-first is priority
- ✅ Simple hosting (GitHub Pages, Netlify, etc.)
- ✅ Quick setup and maintenance
- ✅ Latest vocabulary and fixes (14 books, 3,931 practice items)

### Choose `claude/*` branch if:
- ✅ You need AI-powered features
- ✅ Premium TTS quality is important
- ✅ Multi-device cloud sync required
- ✅ Analytics and tracking needed
- ✅ Modern React + TypeScript stack preferred
- ⚠️ Willing to set up API keys
- ⚠️ Accept ongoing costs (~$10-20/month)

---

## Merging Strategy

### Current Approach: **Parallel Development**
- Both branches develop independently
- No automatic merging between branches
- Features can be ported manually when needed

### Future: Merge PTE improvements to Claude branch
When v3.0.0 is ready for production, port these changes:
1. PTE RS Core Vocabulary (773 terms)
2. RS Segments dataset (1,424 items)
3. IPA pronunciation fixes (14 corrections)
4. Spelling corrections (13 fixes)
5. Documentation cleanup

**Estimated effort:** 4-6 hours to port data + test React components

---

## Git Workflow

### Working on PTE branch:
```bash
git checkout pte
# Make changes
git add .
git commit -m "Description"
git push origin pte
```

### Working on Claude branch:
```bash
git checkout claude/incomplete-description-011CV35Zb4tySmnoS5mf2NyQ
# Make changes
git add .
git commit -m "Description"
git push origin claude/incomplete-description-011CV35Zb4tySmnoS5mf2NyQ
```

### Creating a new feature:
```bash
# Branch from appropriate base
git checkout pte
git checkout -b feature/new-vocabulary-book
# Make changes
git push origin feature/new-vocabulary-book
# Create PR to pte branch
```

---

## Version Comparison

| Aspect | PTE Branch (v2.5.4) | Claude Branch (v3.0.0) |
|--------|---------------------|------------------------|
| **Vocabulary** | 14 books, 13,500+ terms | 13 books, ~12,700 terms |
| **Practice Modes** | 4 modes, 3,931 items | 3 modes, 2,507 items |
| **Technology** | Vanilla JS | React + TypeScript |
| **TTS** | Browser only (free) | Browser + AWS Polly |
| **AI Features** | None | 3 features (Gemini) |
| **Cloud Sync** | localStorage only | Supabase |
| **Dependencies** | None | 60+ npm packages |
| **Setup Time** | 5 minutes | 30-60 minutes |
| **Hosting Cost** | $0 | $10-20/month |
| **Maintenance** | Low | Medium |
| **Build Step** | No | Yes (Vite) |
| **File Size** | ~500KB | ~2-3MB (bundled) |

---

## Recommendations

### For Development (Current Work):
**Continue on `pte` branch** ✅
- All recent improvements are here
- Production-ready and stable
- Simple to test and deploy
- Zero external dependencies

### For Production Deployment:
**Use `pte` branch** ✅
- Mature, tested codebase
- Complete feature set
- No ongoing costs
- Easy maintenance

### For Future (v3.0):
**Develop on `claude/*` branch** when needed
- Modern stack for scalability
- AI features for competitive advantage
- Cloud sync for user retention
- Premium TTS for quality
- But requires significant setup and ongoing costs

---

## Maintenance Notes

**PTE Branch:**
- Update vocabulary files in `data/source/pte/`
- Run `npm run data:pte` to regenerate JSON
- Test in browser, commit changes
- No build step required

**Claude Branch:**
- Update React components in `src/components/`
- Update TypeScript types in `src/types/`
- Run `npm run build` to test production build
- Verify with Vitest: `npm test`
- Requires API key management

---

## Contact & Support

- **Repository:** [Your repo URL]
- **Issues:** Use GitHub Issues
- **Branch:** Specify which branch in issue title
- **Documentation:** See `docs/` folder in each branch

**Last Updated:** November 12, 2025
**Current Stable Branch:** `pte` (v2.5.4)
**Experimental Branch:** `claude/incomplete-description-011CV35Zb4tySmnoS5mf2NyQ` (v3.0.0)
