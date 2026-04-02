# Dress Claude — Design Specification

## Overview

**Dress Claude** is a web application that helps people dress better by analyzing their personal colorimetry (seasonal color analysis) and providing an interactive avatar to experiment with clothing color combinations.

**Target audience:** General public (men & women) who want to dress better.
**Platform:** Responsive web app (browser-based).

## Core Concept

Every person has a "color season" (one of 12 types) that determines which colors look best on them. Dress Claude:
1. Determines the user's season via a guided quiz + optional photo analysis
2. Provides a personalized color palette (~30 colors)
3. Offers an interactive avatar where users can try different color combinations
4. Suggests complementary palettes dynamically when a clothing color is changed
5. Lets users save outfits to a virtual wardrobe

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database & Auth:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS
- **Avatar:** SVG-based with dynamic color application (2D illustrations styled to look 3D, inspired by Bitmoji/Ready Player Me aesthetic)
- **Image Analysis:** Client-side color extraction from selfie photos (Canvas API) + season classification algorithm
- **Deployment:** Vercel

## Architecture — 5 Modules

### Module 1: Onboarding & Auth

**Purpose:** User registration, login, and initial profile setup.

**Flow:**
1. Landing page with app presentation and CTA "Discover your season"
2. Sign up / Log in via Supabase Auth (email + password, optionally social login later)
3. Gender selection (Male / Female) — affects avatar body type and clothing options
4. Redirect to colorimetry quiz

**Landing Page Content:**
- Hero section with app name, tagline, and a CTA button "Découvre ta saison"
- Brief visual explanation of the 4 season families (Spring, Summer, Autumn, Winter)
- Preview of the avatar feature (static mockup)
- Testimonials or stats (can be placeholder initially)

**Pages:** `/` (landing), `/login`, `/signup`

### Module 2: Colorimetry Analysis

**Purpose:** Determine the user's seasonal color type.

**The 12 Seasons:**
- **Spring:** Light Spring, Warm Spring, Bright Spring
- **Summer:** Light Summer, Cool Summer, Soft Summer
- **Autumn:** Soft Autumn, Warm Autumn, Deep Autumn
- **Winter:** Deep Winter, Cool Winter, Bright Winter

**Step 1 — Guided Quiz (required):**

Questions (one per screen, with visual aids):
1. **Skin tone:** Fair / Medium / Deep + undertone (warm/cool/neutral) — shown with color swatches
2. **Eye color:** Blue, Green, Hazel, Brown, Dark Brown — with nuance sub-options
3. **Natural hair color:** Blonde, Light Brown, Medium Brown, Dark Brown, Black, Red
4. **Overall contrast:** High / Medium / Low (visual examples showing contrast between skin, eyes, hair)

The algorithm cross-references answers against a scoring matrix to determine the most likely season. Each answer maps to weighted scores for warmth/coolness, lightness/darkness, and mutedness/brightness.

**Step 2 — Photo Analysis (optional, to refine):**
1. User uploads a selfie (guidelines: natural light, no makeup, hair visible)
2. Client-side Canvas API extracts dominant colors from skin, eye, and hair regions
3. Extracted colors are compared against reference values for each season
4. Result either confirms or adjusts the quiz-based season

**Output:**
- Primary season (e.g., "Deep Winter")
- Confidence level (High / Medium)
- Season description and characteristics
- Personal palette: ~30 recommended colors
- Colors to avoid
- Recommended color combinations (top + bottom pairings)

**Pages:** `/quiz` (multi-step), `/quiz/photo` (optional), `/result`

### Module 3: Interactive Avatar

**Purpose:** Let users experiment with clothing colors on a virtual avatar.

**Avatar Design:**
- SVG-based illustration with a 3D-stylized look (inspired by the reference image: Bitmoji/Ready Player Me style)
- Gender-specific body types (male/female based on profile)
- Skin tone matches user's actual skin tone (from quiz)
- Hair color from quiz data (modifiable — changing hair color triggers colorimetry recalculation)

**Clickable Zones:**
1. **Hair** (color changeable — impacts colorimetry recalculation)
2. **Top** (t-shirt, shirt, blouse, sweater)
3. **Bottom** (pants, skirt, shorts)
4. **Shoes** (sneakers, boots, heels)
5. **Accessories** (optional, v2: scarf, hat, bag)

**Hair & Colorimetry Link:**
When the user changes hair color on the avatar, the app recalculates the contrast level (skin vs. hair vs. eyes) and may suggest a different season. Example: a Deep Winter who goes platinum blonde might shift toward Cool Summer. The flow is:
1. User clicks hair zone → color picker with realistic hair colors (not fantasy colors)
2. Hair color updates on avatar
3. App recalculates contrast and season fit
4. If the season changes: a notification appears ("With this hair color, your palette shifts to Cool Summer") and the clothing color suggestions update accordingly
5. If the season stays the same: no disruption, clothing suggestions remain

**Interaction Flow:**
1. User clicks a clothing zone on the avatar
2. Right panel shows recommended colors from their personal palette
3. User selects a color → avatar updates in real-time
4. The suggestion panel updates automatically: "With this [color] top, try these combinations:"
5. Shows 3 outfit combination suggestions (complementary bottom + shoes colors)
6. User can click another zone and repeat
7. "Save outfit" button stores the combination

**Color Suggestion Algorithm:**
- Based on color theory: complementary, analogous, and triadic harmonies
- Filtered through the user's seasonal palette (only suggests colors that suit them)
- Considers contrast rules (e.g., Deep Winter = high contrast encouraged)

**Pages:** `/avatar` (main interactive page)

### Module 4: Wardrobe & Outfits

**Purpose:** Save and manage clothing items and outfit combinations.

**Features:**
- **Saved Outfits:** List of outfits created on the avatar, shown as mini-avatar thumbnails
- **Outfit History:** Chronological list with date stamps
- **Favorites:** Star outfits to mark as favorites
- **Share:** Generate a shareable image/link of an outfit (social feature)

**Pages:** `/wardrobe`

### Module 5: Education & Guide

**Purpose:** Teach users about colorimetry and help them understand why certain colors work.

**Content:**
- "What is colorimetry?" — introduction article
- "The 12 seasons explained" — detailed page with examples for each season
- "Color wheel basics" — how complementary, analogous, triadic colors work
- "Contrast and harmony" — how to build outfits with good contrast
- "Common mistakes" — colors that seem right but don't work

**Pages:** `/guide`, `/guide/[article-slug]`

## Database Schema (Supabase)

### Tables

**profiles**
- `id` (uuid, FK to auth.users)
- `gender` (text: 'male' | 'female')
- `season` (text: one of 12 season codes)
- `skin_tone` (text)
- `eye_color` (text)
- `hair_color` (text)
- `contrast_level` (text)
- `photo_url` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**quiz_results**
- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `answers` (jsonb: quiz responses)
- `season_result` (text)
- `confidence` (text: 'high' | 'medium')
- `photo_analysis` (jsonb, nullable)
- `created_at` (timestamp)

**outfits**
- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `name` (text, nullable)
- `top_color` (text: hex color)
- `bottom_color` (text: hex color)
- `shoes_color` (text: hex color)
- `accessories_color` (text, nullable: hex color)
- `is_favorite` (boolean, default false)
- `created_at` (timestamp)

**wardrobe_items** (v2, future)
- `id` (uuid)
- `user_id` (uuid, FK to profiles)
- `category` (text: 'top' | 'bottom' | 'shoes' | 'accessory')
- `color` (text: hex color)
- `name` (text)
- `created_at` (timestamp)

### Row Level Security (RLS)
All tables use RLS: users can only read/write their own data.

## Color Data

### Season Palettes
Each season has a predefined palette stored as a JSON constant in the codebase (not in the database). Example:

```
DEEP_WINTER: {
  name: "Deep Winter",
  emoji: "❄️",
  description: "Strong contrasts, saturated and deep colors",
  colors: ["#000000", "#1a1a4a", "#8B0000", "#006400", "#4B0082", "#FFFFFF", "#C0C0C0", "#FF1493", ...],
  avoid: ["#F5DEB3", "#FFA07A", "#98FB98", ...],
  characteristics: { warmth: "cool", depth: "deep", clarity: "bright" }
}
```

### Combination Rules
Stored as a rules engine mapping:
- For each selected color → list of compatible bottom colors and shoe colors
- Filtered by the user's season palette
- Considers contrast level (high/medium/low based on season)

## Pages Summary

| Route | Page | Auth Required |
|-------|------|--------------|
| `/` | Landing / Marketing | No |
| `/login` | Login | No |
| `/signup` | Sign up | No |
| `/quiz` | Colorimetry quiz (multi-step) | Yes |
| `/quiz/photo` | Photo upload for refinement | Yes |
| `/result` | Season result & palette | Yes |
| `/avatar` | Interactive avatar dress-up | Yes |
| `/wardrobe` | Saved outfits & wardrobe | Yes |
| `/guide` | Educational articles index | No |
| `/guide/[slug]` | Individual article | No |

## UI/UX Guidelines

- **Design:** Clean, modern, fashion-forward. Soft gradients, rounded corners, subtle shadows.
- **Colors:** Neutral base (whites, light grays) to let the color palettes stand out.
- **Typography:** Sans-serif, clean. Two weights: regular body, bold headings.
- **Mobile-first:** Bottom navigation bar on mobile, sidebar on desktop.
- **Interactions:** Smooth transitions when colors change on the avatar. Subtle hover effects on color swatches.
- **Avatar:** Central focus of the app. Large, prominent, with clear click targets on clothing zones.

## Non-Goals (explicitly out of scope)

- E-commerce links / shopping integration
- Real clothing textures or patterns (solid colors only)
- 3D rendering (Three.js / WebGL)
- Native mobile app
- AI-generated fashion advice text
- Social features beyond basic sharing (no feed, no followers)

## Verification

### How to test end-to-end:
1. **Auth:** Sign up, log in, verify profile creation in Supabase
2. **Quiz:** Complete all quiz steps, verify season determination is logical
3. **Photo:** Upload a photo, verify color extraction runs without errors
4. **Avatar:** Click each zone, change colors, verify suggestions update
5. **Save:** Save an outfit, verify it appears in wardrobe
6. **Responsive:** Test on mobile viewport (375px) and desktop (1440px)
7. **Guide:** Navigate to articles, verify content renders correctly
