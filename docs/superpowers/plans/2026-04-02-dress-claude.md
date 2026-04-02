# Dress Claude — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app that determines a user's color season via quiz + photo, then provides an interactive avatar to experiment with clothing color combinations and save outfits.

**Architecture:** Next.js 14 App Router with Supabase for auth/database/storage. SVG-based interactive avatar with dynamic color application. Client-side photo analysis via Canvas API. Color data stored as constants, user data in PostgreSQL.

**Tech Stack:** Next.js 14, React 18, Supabase (Auth + PostgreSQL + Storage), Tailwind CSS, TypeScript

**User Verification:** NO — no user verification required during implementation.

---

## File Structure

```
dress-claude/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with nav + Supabase provider
│   │   ├── page.tsx                      # Landing page
│   │   ├── globals.css                   # Tailwind + global styles
│   │   ├── login/page.tsx                # Login form
│   │   ├── signup/page.tsx               # Signup form
│   │   ├── quiz/
│   │   │   ├── page.tsx                  # Multi-step quiz
│   │   │   └── photo/page.tsx            # Photo upload & analysis
│   │   ├── result/page.tsx               # Season result display
│   │   ├── avatar/page.tsx               # Interactive avatar page
│   │   ├── wardrobe/page.tsx             # Saved outfits
│   │   └── guide/
│   │       ├── page.tsx                  # Articles index
│   │       └── [slug]/page.tsx           # Individual article
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                # Desktop sidebar + mobile bottom nav
│   │   │   └── AuthGuard.tsx             # Redirect to login if not authenticated
│   │   ├── avatar/
│   │   │   ├── AvatarSvg.tsx             # Main SVG avatar component
│   │   │   ├── AvatarZone.tsx            # Clickable zone wrapper
│   │   │   └── ColorPicker.tsx           # Color swatch selector panel
│   │   ├── quiz/
│   │   │   ├── QuizStep.tsx              # Single quiz step (question + options)
│   │   │   ├── QuizProgress.tsx          # Progress indicator
│   │   │   └── PhotoAnalyzer.tsx         # Photo upload + color extraction
│   │   └── wardrobe/
│   │       ├── OutfitCard.tsx            # Mini avatar thumbnail for saved outfit
│   │       └── OutfitGrid.tsx            # Grid of saved outfits
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   ├── server.ts                 # Server Supabase client
│   │   │   └── middleware.ts             # Auth middleware
│   │   ├── colorimetry/
│   │   │   ├── seasons.ts                # 12 season definitions + palettes
│   │   │   ├── quiz-scoring.ts           # Quiz answer → season algorithm
│   │   │   ├── photo-analysis.ts         # Canvas API color extraction
│   │   │   ├── color-combinations.ts     # Outfit suggestion algorithm
│   │   │   └── hair-recalculation.ts     # Hair color change → season update
│   │   └── guide/
│   │       └── articles.ts               # Guide article content
│   └── types/
│       └── index.ts                      # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Database schema
├── public/                               # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── middleware.ts                          # Next.js middleware for auth
└── .env.local.example                    # Environment variables template
```

---

## Task 0: Project Setup & Configuration

**Goal:** Initialize a working Next.js project with Supabase, Tailwind, and TypeScript.

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`, `postcss.config.js`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.local.example`, `.gitignore`

**Acceptance Criteria:**
- [ ] `npm run dev` starts the app on localhost:3000
- [ ] Tailwind CSS works (utility classes render correctly)
- [ ] TypeScript compiles without errors

**Verify:** `npm run build` → builds successfully with no errors

**Steps:**

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:\Users\nhu-s\Documents\programs\dress-claude
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

- [ ] **Step 2: Install Supabase dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Create environment template**

Create `.env.local.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- [ ] **Step 4: Create TypeScript types**

Create `src/types/index.ts`:
```typescript
export type Gender = 'male' | 'female'

export type SeasonCode =
  | 'light-spring' | 'warm-spring' | 'bright-spring'
  | 'light-summer' | 'cool-summer' | 'soft-summer'
  | 'soft-autumn' | 'warm-autumn' | 'deep-autumn'
  | 'deep-winter' | 'cool-winter' | 'bright-winter'

export type SkinTone = 'fair' | 'medium' | 'deep'
export type Undertone = 'warm' | 'cool' | 'neutral'
export type EyeColor = 'blue' | 'green' | 'hazel' | 'brown' | 'dark-brown'
export type HairColor = 'blonde' | 'light-brown' | 'medium-brown' | 'dark-brown' | 'black' | 'red'
export type ContrastLevel = 'high' | 'medium' | 'low'

export interface Profile {
  id: string
  gender: Gender
  season: SeasonCode | null
  skin_tone: SkinTone | null
  eye_color: EyeColor | null
  hair_color: HairColor | null
  contrast_level: ContrastLevel | null
  photo_url: string | null
  created_at: string
  updated_at: string
}

export interface QuizAnswers {
  skin_tone: SkinTone
  undertone: Undertone
  eye_color: EyeColor
  hair_color: HairColor
  contrast_level: ContrastLevel
}

export interface QuizResult {
  id: string
  user_id: string
  answers: QuizAnswers
  season_result: SeasonCode
  confidence: 'high' | 'medium'
  photo_analysis: PhotoAnalysis | null
  created_at: string
}

export interface PhotoAnalysis {
  skin_hex: string
  eye_hex: string
  hair_hex: string
  adjusted_season: SeasonCode | null
}

export interface Outfit {
  id: string
  user_id: string
  name: string | null
  hair_color: string
  top_color: string
  bottom_color: string
  shoes_color: string
  accessories_color: string | null
  is_favorite: boolean
  created_at: string
}

export interface SeasonPalette {
  code: SeasonCode
  name: string
  emoji: string
  family: 'spring' | 'summer' | 'autumn' | 'winter'
  description: string
  colors: string[]
  avoid: string[]
  hairColors: string[]
  characteristics: {
    warmth: 'warm' | 'cool'
    depth: 'light' | 'deep'
    clarity: 'bright' | 'soft'
  }
}

export type AvatarZoneId = 'hair' | 'top' | 'bottom' | 'shoes'

export interface AvatarState {
  hair: string
  top: string
  bottom: string
  shoes: string
}
```

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Next.js project with Supabase and Tailwind"
```

---

## Task 1: Supabase Configuration & Database Schema

**Goal:** Set up Supabase client utilities and create the database schema.

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `supabase/migrations/001_initial_schema.sql`

**Acceptance Criteria:**
- [ ] Supabase browser client connects successfully
- [ ] Supabase server client works in Server Components
- [ ] Auth middleware refreshes sessions on each request
- [ ] SQL migration creates all required tables with RLS

**Verify:** `npm run build` → no TypeScript errors

**Steps:**

- [ ] **Step 1: Create browser Supabase client**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create server Supabase client**

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Create middleware helper**

Create `src/lib/supabase/middleware.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}
```

- [ ] **Step 4: Create Next.js middleware**

Create `middleware.ts`:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 5: Create database migration**

Create `supabase/migrations/001_initial_schema.sql`:
```sql
-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  gender text check (gender in ('male', 'female')),
  season text,
  skin_tone text,
  eye_color text,
  hair_color text,
  contrast_level text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Quiz results table
create table public.quiz_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  answers jsonb not null,
  season_result text not null,
  confidence text check (confidence in ('high', 'medium')) not null,
  photo_analysis jsonb,
  created_at timestamptz default now()
);

alter table public.quiz_results enable row level security;

create policy "Users can view own quiz results"
  on public.quiz_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz results"
  on public.quiz_results for insert
  with check (auth.uid() = user_id);

-- Outfits table
create table public.outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text,
  hair_color text not null,
  top_color text not null,
  bottom_color text not null,
  shoes_color text not null,
  accessories_color text,
  is_favorite boolean default false,
  created_at timestamptz default now()
);

alter table public.outfits enable row level security;

create policy "Users can view own outfits"
  on public.outfits for select
  using (auth.uid() = user_id);

create policy "Users can insert own outfits"
  on public.outfits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own outfits"
  on public.outfits for update
  using (auth.uid() = user_id);

create policy "Users can delete own outfits"
  on public.outfits for delete
  using (auth.uid() = user_id);
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/supabase/ middleware.ts supabase/
git commit -m "feat: add Supabase client config and database schema"
```

---

## Task 2: Colorimetry Data — Season Palettes & Quiz Scoring

**Goal:** Define the 12 season palettes, the quiz scoring algorithm, and the color combination engine.

**Files:**
- Create: `src/lib/colorimetry/seasons.ts`
- Create: `src/lib/colorimetry/quiz-scoring.ts`
- Create: `src/lib/colorimetry/color-combinations.ts`
- Create: `src/lib/colorimetry/hair-recalculation.ts`

**Acceptance Criteria:**
- [ ] All 12 seasons defined with names, palettes (~30 colors each), avoid lists, hair colors
- [ ] Quiz scoring returns a season + confidence for any valid answer combination
- [ ] Color combination engine returns 3 outfit suggestions for any selected color
- [ ] Hair recalculation returns updated season when hair color changes

**Verify:** `npm run build` → no TypeScript errors

**Steps:**

- [ ] **Step 1: Define all 12 season palettes**

Create `src/lib/colorimetry/seasons.ts`:
```typescript
import { SeasonCode, SeasonPalette } from '@/types'

export const SEASONS: Record<SeasonCode, SeasonPalette> = {
  'light-spring': {
    code: 'light-spring',
    name: 'Light Spring',
    emoji: '🌸',
    family: 'spring',
    description: 'Couleurs légères, lumineuses et chaudes. Teintes pastel vivantes.',
    colors: [
      '#FADADD', '#FFB6C1', '#FFDAB9', '#FFE4B5', '#FFFACD',
      '#E0F0E0', '#B5EAD7', '#C7CEEA', '#FFD700', '#FF6347',
      '#FFA07A', '#F08080', '#90EE90', '#87CEEB', '#DDA0DD',
      '#F5DEB3', '#FAFAD2', '#FFE4E1', '#FFF0F5', '#FFFFF0',
      '#FF69B4', '#FF7F50', '#FFDEAD', '#EEE8AA', '#98FB98',
      '#AFEEEE', '#DB7093', '#F0E68C', '#FFC0CB', '#FFE4C4'
    ],
    avoid: ['#000000', '#1C1C1C', '#2F4F4F', '#191970', '#4B0082'],
    hairColors: ['#F5DEB3', '#D2B48C', '#C4A882', '#B8860B', '#DAA520', '#CD853F'],
    characteristics: { warmth: 'warm', depth: 'light', clarity: 'bright' }
  },
  'warm-spring': {
    code: 'warm-spring',
    name: 'Warm Spring',
    emoji: '🌻',
    family: 'spring',
    description: 'Couleurs chaudes et dorées. Tons pêche, corail, turquoise.',
    colors: [
      '#FF6347', '#FF7F50', '#FFA500', '#FFD700', '#FFDAB9',
      '#F4A460', '#DAA520', '#CD853F', '#DEB887', '#D2691E',
      '#FF4500', '#FF8C00', '#FFA07A', '#FFDEAD', '#FFE4B5',
      '#BDB76B', '#808000', '#6B8E23', '#9ACD32', '#32CD32',
      '#00CED1', '#20B2AA', '#40E0D0', '#48D1CC', '#7FFFD4',
      '#F0E68C', '#EEE8AA', '#FFFACD', '#FAFAD2', '#FFFFF0'
    ],
    avoid: ['#000000', '#C0C0C0', '#808080', '#4B0082', '#FF1493'],
    hairColors: ['#B8860B', '#DAA520', '#CD853F', '#D2691E', '#A0522D', '#8B4513'],
    characteristics: { warmth: 'warm', depth: 'deep', clarity: 'bright' }
  },
  'bright-spring': {
    code: 'bright-spring',
    name: 'Bright Spring',
    emoji: '🌈',
    family: 'spring',
    description: 'Couleurs vives et saturées. Contrastes nets avec des teintes chaudes.',
    colors: [
      '#FF0000', '#FF4500', '#FF6347', '#FF7F50', '#FFA500',
      '#FFD700', '#FFFF00', '#00FF00', '#32CD32', '#00CED1',
      '#00BFFF', '#1E90FF', '#4169E1', '#FF1493', '#FF69B4',
      '#FF00FF', '#BA55D3', '#9370DB', '#00FA9A', '#7FFF00',
      '#FFFFFF', '#FFF8DC', '#FFFAF0', '#F0FFFF', '#F5FFFA',
      '#FFDAB9', '#FFE4B5', '#FFEFD5', '#FFF5EE', '#FDF5E6'
    ],
    avoid: ['#808080', '#A9A9A9', '#BC8F8F', '#D2B48C', '#C0C0C0'],
    hairColors: ['#8B4513', '#A0522D', '#D2691E', '#CD853F', '#B8860B', '#1C1C1C'],
    characteristics: { warmth: 'warm', depth: 'light', clarity: 'bright' }
  },
  'light-summer': {
    code: 'light-summer',
    name: 'Light Summer',
    emoji: '🌊',
    family: 'summer',
    description: 'Couleurs douces, fraîches et pastel. Teintes lavande et rose poudré.',
    colors: [
      '#E6E6FA', '#D8BFD8', '#DDA0DD', '#EE82EE', '#DA70D6',
      '#C71585', '#DB7093', '#FF69B4', '#FFB6C1', '#FFC0CB',
      '#B0C4DE', '#ADD8E6', '#87CEEB', '#87CEFA', '#00BFFF',
      '#AFEEEE', '#E0FFFF', '#F0F8FF', '#F5F5DC', '#FFF0F5',
      '#FFE4E1', '#FAEBD7', '#FFFAFA', '#F0FFF0', '#F5FFFA',
      '#B0E0E6', '#5F9EA0', '#6495ED', '#7B68EE', '#9370DB'
    ],
    avoid: ['#000000', '#8B0000', '#006400', '#191970', '#FF4500'],
    hairColors: ['#D2B48C', '#C4A882', '#A9A9A9', '#808080', '#B8860B', '#DEB887'],
    characteristics: { warmth: 'cool', depth: 'light', clarity: 'soft' }
  },
  'cool-summer': {
    code: 'cool-summer',
    name: 'Cool Summer',
    emoji: '❄️',
    family: 'summer',
    description: 'Couleurs fraîches et douces. Rose, bleu et gris subtils.',
    colors: [
      '#4682B4', '#5F9EA0', '#6495ED', '#7B68EE', '#9370DB',
      '#8B008B', '#9932CC', '#BA55D3', '#C71585', '#DB7093',
      '#FF69B4', '#FFB6C1', '#FFC0CB', '#B0C4DE', '#778899',
      '#708090', '#A9A9A9', '#C0C0C0', '#D3D3D3', '#DCDCDC',
      '#E0E0E0', '#F5F5F5', '#FFFFFF', '#E6E6FA', '#D8BFD8',
      '#FFFAFA', '#F0F8FF', '#F8F8FF', '#F0FFF0', '#FFF0F5'
    ],
    avoid: ['#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#8B4513'],
    hairColors: ['#696969', '#808080', '#A9A9A9', '#4A4A4A', '#2F2F2F', '#5C4033'],
    characteristics: { warmth: 'cool', depth: 'light', clarity: 'soft' }
  },
  'soft-summer': {
    code: 'soft-summer',
    name: 'Soft Summer',
    emoji: '🌫️',
    family: 'summer',
    description: 'Couleurs douces et atténuées. Teintes poudrées et grisées.',
    colors: [
      '#778899', '#708090', '#B0C4DE', '#AFEEEE', '#E0FFFF',
      '#D8BFD8', '#DDA0DD', '#E6E6FA', '#C0C0C0', '#A9A9A9',
      '#BC8F8F', '#CD5C5C', '#DB7093', '#D2B48C', '#C4A882',
      '#8FBC8F', '#2E8B57', '#3CB371', '#66CDAA', '#5F9EA0',
      '#4682B4', '#6495ED', '#9370DB', '#8B7D7B', '#D2691E',
      '#F5F5DC', '#FAEBD7', '#FFF8DC', '#FAF0E6', '#FFFFF0'
    ],
    avoid: ['#FF0000', '#FF4500', '#00FF00', '#FFD700', '#000000'],
    hairColors: ['#8B7355', '#A0522D', '#696969', '#808080', '#6B4423', '#8B7765'],
    characteristics: { warmth: 'cool', depth: 'light', clarity: 'soft' }
  },
  'soft-autumn': {
    code: 'soft-autumn',
    name: 'Soft Autumn',
    emoji: '🍂',
    family: 'autumn',
    description: 'Couleurs chaudes et atténuées. Tons terre doux et poudrés.',
    colors: [
      '#D2B48C', '#DEB887', '#F5DEB3', '#FAEBD7', '#FFE4C4',
      '#CD853F', '#D2691E', '#8B4513', '#A0522D', '#BC8F8F',
      '#F4A460', '#DAA520', '#B8860B', '#808000', '#6B8E23',
      '#556B2F', '#2E8B57', '#8FBC8F', '#BDB76B', '#9ACD32',
      '#CD5C5C', '#B22222', '#A52A2A', '#8B0000', '#C0C0C0',
      '#708090', '#778899', '#696969', '#FAFAD2', '#FFF8DC'
    ],
    avoid: ['#FF1493', '#FF69B4', '#00BFFF', '#1E90FF', '#000000'],
    hairColors: ['#8B7355', '#A0522D', '#6B4423', '#8B7765', '#D2B48C', '#C4A882'],
    characteristics: { warmth: 'warm', depth: 'light', clarity: 'soft' }
  },
  'warm-autumn': {
    code: 'warm-autumn',
    name: 'Warm Autumn',
    emoji: '🍁',
    family: 'autumn',
    description: 'Couleurs chaudes et profondes. Rouille, olive, moutarde.',
    colors: [
      '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#B8860B',
      '#DAA520', '#808000', '#556B2F', '#6B8E23', '#2E8B57',
      '#8B0000', '#A52A2A', '#B22222', '#CD5C5C', '#FF4500',
      '#FF6347', '#FF8C00', '#FFA500', '#D2B48C', '#DEB887',
      '#F5DEB3', '#FAEBD7', '#FFE4B5', '#FFDAB9', '#BDB76B',
      '#696969', '#808080', '#778899', '#F4A460', '#E9967A'
    ],
    avoid: ['#FF1493', '#FF69B4', '#00BFFF', '#C0C0C0', '#000000'],
    hairColors: ['#8B4513', '#A0522D', '#D2691E', '#B8860B', '#6B4423', '#800000'],
    characteristics: { warmth: 'warm', depth: 'deep', clarity: 'soft' }
  },
  'deep-autumn': {
    code: 'deep-autumn',
    name: 'Deep Autumn',
    emoji: '🌰',
    family: 'autumn',
    description: 'Couleurs chaudes, profondes et riches. Bordeaux, vert forêt, chocolat.',
    colors: [
      '#800000', '#8B0000', '#A52A2A', '#B22222', '#8B4513',
      '#A0522D', '#D2691E', '#006400', '#228B22', '#2E8B57',
      '#556B2F', '#6B8E23', '#808000', '#B8860B', '#DAA520',
      '#191970', '#000080', '#2F4F4F', '#4B0082', '#800080',
      '#D2B48C', '#DEB887', '#FFD700', '#FF8C00', '#FF4500',
      '#1C1C1C', '#333333', '#696969', '#F5DEB3', '#FAEBD7'
    ],
    avoid: ['#FFB6C1', '#FFC0CB', '#E6E6FA', '#ADD8E6', '#AFEEEE'],
    hairColors: ['#1C1C1C', '#2F2F2F', '#4A3728', '#3B2314', '#8B4513', '#800000'],
    characteristics: { warmth: 'warm', depth: 'deep', clarity: 'soft' }
  },
  'deep-winter': {
    code: 'deep-winter',
    name: 'Deep Winter',
    emoji: '🌑',
    family: 'winter',
    description: 'Contrastes forts, couleurs saturées et profondes.',
    colors: [
      '#000000', '#1C1C1C', '#191970', '#000080', '#00008B',
      '#0000CD', '#8B0000', '#B22222', '#006400', '#008000',
      '#4B0082', '#800080', '#8B008B', '#C71585', '#FF1493',
      '#FFFFFF', '#F5F5F5', '#DCDCDC', '#C0C0C0', '#FF0000',
      '#00FF00', '#1E90FF', '#FF00FF', '#FFD700', '#00CED1',
      '#DC143C', '#4169E1', '#2E8B57', '#9400D3', '#FF4500'
    ],
    avoid: ['#F5DEB3', '#FFA07A', '#98FB98', '#DEB887', '#D2B48C'],
    hairColors: ['#000000', '#1C1C1C', '#2F2F2F', '#1a0a00', '#3B2314', '#4A3728'],
    characteristics: { warmth: 'cool', depth: 'deep', clarity: 'bright' }
  },
  'cool-winter': {
    code: 'cool-winter',
    name: 'Cool Winter',
    emoji: '❄️',
    family: 'winter',
    description: 'Couleurs froides et vives. Bleu glacier, rose fuchsia, argent.',
    colors: [
      '#000000', '#191970', '#000080', '#0000FF', '#4169E1',
      '#1E90FF', '#00BFFF', '#87CEEB', '#FF1493', '#FF69B4',
      '#C71585', '#8B008B', '#9400D3', '#BA55D3', '#4B0082',
      '#FFFFFF', '#F5F5F5', '#C0C0C0', '#808080', '#708090',
      '#E6E6FA', '#D8BFD8', '#B0C4DE', '#F0F8FF', '#FFFAFA',
      '#DC143C', '#FF0000', '#00CED1', '#20B2AA', '#2E8B57'
    ],
    avoid: ['#FF8C00', '#FFA500', '#FFD700', '#8B4513', '#D2691E'],
    hairColors: ['#000000', '#1C1C1C', '#4A4A4A', '#696969', '#2F2F2F', '#3B2314'],
    characteristics: { warmth: 'cool', depth: 'deep', clarity: 'bright' }
  },
  'bright-winter': {
    code: 'bright-winter',
    name: 'Bright Winter',
    emoji: '💎',
    family: 'winter',
    description: 'Couleurs éclatantes et contrastées. Jewel tones vifs.',
    colors: [
      '#FF0000', '#0000FF', '#FF00FF', '#00FFFF', '#FFD700',
      '#FF1493', '#00FF00', '#FF4500', '#8A2BE2', '#DC143C',
      '#4169E1', '#1E90FF', '#00CED1', '#FF69B4', '#9400D3',
      '#000000', '#FFFFFF', '#C0C0C0', '#F5F5F5', '#191970',
      '#006400', '#8B0000', '#4B0082', '#800080', '#008B8B',
      '#B22222', '#2E8B57', '#6A5ACD', '#483D8B', '#00008B'
    ],
    avoid: ['#D2B48C', '#DEB887', '#F5DEB3', '#BC8F8F', '#808080'],
    hairColors: ['#000000', '#1C1C1C', '#3B2314', '#4A3728', '#2F2F2F', '#4A4A4A'],
    characteristics: { warmth: 'cool', depth: 'deep', clarity: 'bright' }
  }
}

export function getSeasonByCode(code: SeasonCode): SeasonPalette {
  return SEASONS[code]
}

export function getAllSeasons(): SeasonPalette[] {
  return Object.values(SEASONS)
}

export function getSeasonsByFamily(family: SeasonPalette['family']): SeasonPalette[] {
  return Object.values(SEASONS).filter(s => s.family === family)
}
```

- [ ] **Step 2: Create quiz scoring algorithm**

Create `src/lib/colorimetry/quiz-scoring.ts`:
```typescript
import { QuizAnswers, SeasonCode } from '@/types'

interface ScoreAxis {
  warmth: number  // -1 (cool) to +1 (warm)
  depth: number   // -1 (light) to +1 (deep)
  clarity: number // -1 (soft) to +1 (bright)
}

const SKIN_SCORES: Record<string, Partial<ScoreAxis>> = {
  'fair-warm': { warmth: 0.5, depth: -0.8 },
  'fair-cool': { warmth: -0.5, depth: -0.8 },
  'fair-neutral': { warmth: 0, depth: -0.8 },
  'medium-warm': { warmth: 0.5, depth: 0 },
  'medium-cool': { warmth: -0.5, depth: 0 },
  'medium-neutral': { warmth: 0, depth: 0 },
  'deep-warm': { warmth: 0.5, depth: 0.8 },
  'deep-cool': { warmth: -0.5, depth: 0.8 },
  'deep-neutral': { warmth: 0, depth: 0.8 },
}

const EYE_SCORES: Record<string, Partial<ScoreAxis>> = {
  'blue': { warmth: -0.3, clarity: 0.3 },
  'green': { warmth: 0.2, clarity: 0.2 },
  'hazel': { warmth: 0.3, clarity: -0.1 },
  'brown': { warmth: 0.1, depth: 0.2 },
  'dark-brown': { warmth: 0, depth: 0.5 },
}

const HAIR_SCORES: Record<string, Partial<ScoreAxis>> = {
  'blonde': { warmth: 0.3, depth: -0.7, clarity: 0.2 },
  'light-brown': { warmth: 0.1, depth: -0.3, clarity: 0 },
  'medium-brown': { warmth: 0, depth: 0.1, clarity: -0.1 },
  'dark-brown': { warmth: -0.1, depth: 0.5, clarity: -0.1 },
  'black': { warmth: -0.2, depth: 0.8, clarity: 0.3 },
  'red': { warmth: 0.6, depth: 0, clarity: 0.3 },
}

const CONTRAST_SCORES: Record<string, Partial<ScoreAxis>> = {
  'high': { clarity: 0.6 },
  'medium': { clarity: 0 },
  'low': { clarity: -0.6 },
}

const SEASON_TARGETS: Record<SeasonCode, ScoreAxis> = {
  'light-spring':  { warmth: 0.5, depth: -0.7, clarity: 0.3 },
  'warm-spring':   { warmth: 0.8, depth: 0.2, clarity: 0.5 },
  'bright-spring': { warmth: 0.4, depth: -0.3, clarity: 0.8 },
  'light-summer':  { warmth: -0.3, depth: -0.7, clarity: -0.3 },
  'cool-summer':   { warmth: -0.7, depth: -0.2, clarity: -0.3 },
  'soft-summer':   { warmth: -0.2, depth: -0.3, clarity: -0.7 },
  'soft-autumn':   { warmth: 0.3, depth: -0.2, clarity: -0.7 },
  'warm-autumn':   { warmth: 0.8, depth: 0.5, clarity: -0.3 },
  'deep-autumn':   { warmth: 0.5, depth: 0.8, clarity: -0.3 },
  'deep-winter':   { warmth: -0.3, depth: 0.8, clarity: 0.5 },
  'cool-winter':   { warmth: -0.8, depth: 0.3, clarity: 0.5 },
  'bright-winter': { warmth: -0.3, depth: 0.3, clarity: 0.8 },
}

function computeScores(answers: QuizAnswers): ScoreAxis {
  const skinKey = `${answers.skin_tone}-${answers.undertone}`
  const skin = SKIN_SCORES[skinKey] || {}
  const eye = EYE_SCORES[answers.eye_color] || {}
  const hair = HAIR_SCORES[answers.hair_color] || {}
  const contrast = CONTRAST_SCORES[answers.contrast_level] || {}

  return {
    warmth: (skin.warmth || 0) + (eye.warmth || 0) + (hair.warmth || 0),
    depth: (skin.depth || 0) + (eye.depth || 0) + (hair.depth || 0),
    clarity: (eye.clarity || 0) + (hair.clarity || 0) + (contrast.clarity || 0),
  }
}

function distance(a: ScoreAxis, b: ScoreAxis): number {
  return Math.sqrt(
    Math.pow(a.warmth - b.warmth, 2) +
    Math.pow(a.depth - b.depth, 2) +
    Math.pow(a.clarity - b.clarity, 2)
  )
}

export function determineSeason(answers: QuizAnswers): { season: SeasonCode; confidence: 'high' | 'medium' } {
  const scores = computeScores(answers)

  const ranked = (Object.entries(SEASON_TARGETS) as [SeasonCode, ScoreAxis][])
    .map(([code, target]) => ({ code, dist: distance(scores, target) }))
    .sort((a, b) => a.dist - b.dist)

  const best = ranked[0]
  const second = ranked[1]
  const gap = second.dist - best.dist

  return {
    season: best.code,
    confidence: gap > 0.4 ? 'high' : 'medium',
  }
}
```

- [ ] **Step 3: Create color combination engine**

Create `src/lib/colorimetry/color-combinations.ts`:
```typescript
import { SeasonPalette, AvatarState } from '@/types'

interface OutfitSuggestion {
  label: string
  top: string
  bottom: string
  shoes: string
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) return { h: 0, s: 0, l }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6

  return { h: h * 360, s, l }
}

function colorDistance(hex1: string, hex2: string): number {
  const a = hexToHsl(hex1)
  const b = hexToHsl(hex2)
  const hueDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 180
  return Math.sqrt(hueDiff * hueDiff + (a.s - b.s) ** 2 + (a.l - b.l) ** 2)
}

function isNeutral(hex: string): boolean {
  const { s } = hexToHsl(hex)
  return s < 0.15
}

function getComplementaryHue(h: number): number {
  return (h + 180) % 360
}

function getAnalogousHues(h: number): [number, number] {
  return [(h + 30) % 360, (h + 330) % 360]
}

function findClosestInPalette(targetHue: number, palette: string[], exclude: string[]): string | null {
  let best: string | null = null
  let bestDist = Infinity

  for (const color of palette) {
    if (exclude.includes(color)) continue
    const { h, s } = hexToHsl(color)
    if (s < 0.1) continue
    const dist = Math.min(Math.abs(h - targetHue), 360 - Math.abs(h - targetHue))
    if (dist < bestDist) {
      bestDist = dist
      best = color
    }
  }
  return best
}

function findNeutralInPalette(palette: string[], lightness: 'light' | 'dark', exclude: string[]): string {
  const neutrals = palette.filter(c => {
    if (exclude.includes(c)) return false
    const { s, l } = hexToHsl(c)
    if (s > 0.2) return false
    return lightness === 'light' ? l > 0.5 : l <= 0.5
  })
  return neutrals[0] || (lightness === 'dark' ? '#333333' : '#F5F5F5')
}

export function suggestOutfits(
  selectedZone: keyof AvatarState,
  selectedColor: string,
  season: SeasonPalette
): OutfitSuggestion[] {
  const palette = season.colors
  const { h } = hexToHsl(selectedColor)
  const suggestions: OutfitSuggestion[] = []

  // Suggestion 1: Complementary harmony
  const compHue = getComplementaryHue(h)
  const compColor = findClosestInPalette(compHue, palette, [selectedColor])
  const neutral1 = findNeutralInPalette(palette, 'dark', [selectedColor])
  if (compColor) {
    suggestions.push({
      label: 'Complémentaire',
      top: selectedZone === 'top' ? selectedColor : compColor,
      bottom: selectedZone === 'bottom' ? selectedColor : (selectedZone === 'top' ? compColor : neutral1),
      shoes: selectedZone === 'shoes' ? selectedColor : neutral1,
    })
  }

  // Suggestion 2: Analogous harmony
  const [anaHue1] = getAnalogousHues(h)
  const anaColor = findClosestInPalette(anaHue1, palette, [selectedColor])
  const neutral2 = findNeutralInPalette(palette, 'light', [selectedColor])
  if (anaColor) {
    suggestions.push({
      label: 'Harmonieux',
      top: selectedZone === 'top' ? selectedColor : anaColor,
      bottom: selectedZone === 'bottom' ? selectedColor : (selectedZone === 'top' ? anaColor : neutral2),
      shoes: selectedZone === 'shoes' ? selectedColor : neutral2,
    })
  }

  // Suggestion 3: Neutral + accent
  const darkNeutral = findNeutralInPalette(palette, 'dark', [])
  const lightNeutral = findNeutralInPalette(palette, 'light', [])
  suggestions.push({
    label: 'Neutre + accent',
    top: selectedZone === 'top' ? selectedColor : (isNeutral(selectedColor) ? palette[Math.floor(Math.random() * 10)] : darkNeutral),
    bottom: selectedZone === 'bottom' ? selectedColor : darkNeutral,
    shoes: selectedZone === 'shoes' ? selectedColor : lightNeutral,
  })

  return suggestions.slice(0, 3)
}
```

- [ ] **Step 4: Create hair recalculation module**

Create `src/lib/colorimetry/hair-recalculation.ts`:
```typescript
import { SeasonCode, QuizAnswers, HairColor } from '@/types'
import { determineSeason } from './quiz-scoring'

const HAIR_HEX_TO_NAME: Record<string, HairColor> = {
  '#F5DEB3': 'blonde', '#D2B48C': 'blonde', '#C4A882': 'blonde',
  '#DAA520': 'blonde', '#B8860B': 'light-brown', '#CD853F': 'light-brown',
  '#D2691E': 'medium-brown', '#A0522D': 'medium-brown', '#8B7355': 'medium-brown',
  '#8B4513': 'dark-brown', '#6B4423': 'dark-brown', '#5C4033': 'dark-brown',
  '#4A3728': 'dark-brown', '#3B2314': 'black', '#2F2F2F': 'black',
  '#1C1C1C': 'black', '#000000': 'black', '#4A4A4A': 'black',
  '#696969': 'dark-brown', '#808080': 'light-brown', '#A9A9A9': 'blonde',
  '#800000': 'red', '#993333': 'red', '#CC6633': 'red',
}

function closestHairName(hex: string): HairColor {
  if (HAIR_HEX_TO_NAME[hex]) return HAIR_HEX_TO_NAME[hex]

  // Find closest match by simple RGB distance
  let closest: HairColor = 'medium-brown'
  let minDist = Infinity

  for (const [refHex, name] of Object.entries(HAIR_HEX_TO_NAME)) {
    const r1 = parseInt(hex.slice(1, 3), 16)
    const g1 = parseInt(hex.slice(3, 5), 16)
    const b1 = parseInt(hex.slice(5, 7), 16)
    const r2 = parseInt(refHex.slice(1, 3), 16)
    const g2 = parseInt(refHex.slice(3, 5), 16)
    const b2 = parseInt(refHex.slice(5, 7), 16)
    const dist = Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
    if (dist < minDist) {
      minDist = dist
      closest = name
    }
  }

  return closest
}

export function recalculateSeasonForHair(
  currentAnswers: QuizAnswers,
  newHairHex: string
): { season: SeasonCode; confidence: 'high' | 'medium'; changed: boolean; previousSeason: SeasonCode } {
  const previousResult = determineSeason(currentAnswers)
  const newHairName = closestHairName(newHairHex)

  const updatedAnswers: QuizAnswers = {
    ...currentAnswers,
    hair_color: newHairName,
  }

  const newResult = determineSeason(updatedAnswers)

  return {
    season: newResult.season,
    confidence: newResult.confidence,
    changed: newResult.season !== previousResult.season,
    previousSeason: previousResult.season,
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/colorimetry/ src/types/
git commit -m "feat: add colorimetry engine with 12 seasons, quiz scoring, and color combinations"
```

---

## Task 3: Auth Pages — Landing, Login, Signup

**Goal:** Create the landing page, login, and signup pages with Supabase auth.

**Files:**
- Create: `src/app/page.tsx` (landing)
- Create: `src/app/login/page.tsx`
- Create: `src/app/signup/page.tsx`
- Create: `src/components/layout/Navbar.tsx`
- Create: `src/components/layout/AuthGuard.tsx`
- Modify: `src/app/layout.tsx`

**Acceptance Criteria:**
- [ ] Landing page renders with hero, season preview, and CTA
- [ ] Login form authenticates via Supabase and redirects to `/quiz` or `/avatar`
- [ ] Signup form creates account + profile, redirects to `/quiz`
- [ ] Navbar shows on all pages (sidebar desktop, bottom bar mobile)
- [ ] AuthGuard redirects unauthenticated users to `/login`

**Verify:** `npm run build` → no errors. Manual test: navigate to `/login`, create account.

**Steps:**

- [ ] **Step 1: Create Navbar component**

Create `src/components/layout/Navbar.tsx`:
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const NAV_ITEMS = [
  { href: '/avatar', label: 'Avatar', icon: '👤' },
  { href: '/wardrobe', label: 'Garde-robe', icon: '👗' },
  { href: '/guide', label: 'Guide', icon: '📖' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const publicPages = ['/', '/login', '/signup', '/guide']
  const isPublic = publicPages.some(p => pathname === p || pathname.startsWith('/guide/'))

  if (!user && isPublic) return null

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 bg-white border-r border-gray-100 z-50">
        <Link href="/" className="text-2xl font-bold mb-10">DC</Link>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl mb-2 transition-colors ${
              pathname === item.href ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
        <div className="mt-auto">
          {user && (
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 text-sm">
              ↩️
            </button>
          )}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around z-50">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 ${
              pathname === item.href ? 'text-black' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
```

- [ ] **Step 2: Create AuthGuard component**

Create `src/components/layout/AuthGuard.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return <>{children}</>
}
```

- [ ] **Step 3: Update root layout**

Modify `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dress Claude — Trouve ta palette de couleurs idéale',
  description: 'Application de colorimétrie et de conseil vestimentaire personnalisé.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main className="md:ml-20 pb-20 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Create landing page**

Create `src/app/page.tsx`:
```tsx
import Link from 'next/link'

const SEASON_FAMILIES = [
  { name: 'Printemps', emoji: '🌸', color: 'bg-pink-50', text: 'text-pink-700', desc: 'Couleurs chaudes et lumineuses' },
  { name: 'Été', emoji: '🌊', color: 'bg-blue-50', text: 'text-blue-700', desc: 'Couleurs fraîches et douces' },
  { name: 'Automne', emoji: '🍂', color: 'bg-orange-50', text: 'text-orange-700', desc: 'Couleurs chaudes et profondes' },
  { name: 'Hiver', emoji: '❄️', color: 'bg-indigo-50', text: 'text-indigo-700', desc: 'Couleurs vives et contrastées' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Dress <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Claude</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-500 max-w-md">
          Découvre quelles couleurs te mettent en valeur et compose des tenues harmonieuses.
        </p>
        <Link
          href="/signup"
          className="mt-8 px-8 py-4 bg-black text-white rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Découvre ta saison →
        </Link>
      </section>

      {/* Season families */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">4 familles, 12 saisons</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SEASON_FAMILIES.map(s => (
            <div key={s.name} className={`${s.color} rounded-2xl p-6 text-center`}>
              <span className="text-4xl">{s.emoji}</span>
              <h3 className={`mt-3 font-semibold ${s.text}`}>{s.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 5: Create login page**

Create `src/app/login/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
      return
    }

    router.push('/avatar')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8">Connexion</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Pas de compte ?{' '}
          <Link href="/signup" className="text-black font-medium underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create signup page**

Create `src/app/signup/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Gender } from '@/types'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gender) { setError('Choisis ton genre pour personnaliser ton avatar.'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').update({ gender }).eq('id', data.user.id)
    }

    router.push('/quiz')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-8">Créer un compte</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors"
          />
          <input
            type="password"
            placeholder="Mot de passe (6 caractères min.)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors"
          />
          <div>
            <p className="text-sm text-gray-500 mb-2">Genre (pour ton avatar)</p>
            <div className="flex gap-3">
              {(['male', 'female'] as Gender[]).map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-3 rounded-xl border-2 transition-colors font-medium ${
                    gender === g ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {g === 'male' ? '👨 Homme' : '👩 Femme'}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-black font-medium underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/ src/components/layout/
git commit -m "feat: add landing page, login, signup, and navigation"
```

---

## Task 4: Colorimetry Quiz

**Goal:** Build the multi-step quiz that determines the user's color season.

**Files:**
- Create: `src/app/quiz/page.tsx`
- Create: `src/components/quiz/QuizStep.tsx`
- Create: `src/components/quiz/QuizProgress.tsx`
- Create: `src/app/result/page.tsx`

**Acceptance Criteria:**
- [ ] 4-step quiz renders one question per screen with visual swatches
- [ ] Progress indicator shows current step
- [ ] Quiz result is saved to Supabase (quiz_results + profile.season)
- [ ] Result page shows season name, description, palette, and colors to avoid

**Verify:** `npm run build` → no errors. Manual test: complete quiz, verify result page shows correct season.

**Steps:**

- [ ] **Step 1: Create QuizProgress component**

Create `src/components/quiz/QuizProgress.tsx`:
```tsx
export default function QuizProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= step ? 'bg-black' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create QuizStep component**

Create `src/components/quiz/QuizStep.tsx`:
```tsx
interface QuizOption {
  value: string
  label: string
  swatch?: string // hex color to display
}

interface QuizStepProps {
  question: string
  subtitle?: string
  options: QuizOption[]
  selected: string | null
  onSelect: (value: string) => void
}

export default function QuizStep({ question, subtitle, options, selected, onSelect }: QuizStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{question}</h2>
      {subtitle && <p className="text-gray-500 mb-6">{subtitle}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selected === opt.value
                ? 'border-black bg-gray-50 scale-[1.02]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.swatch && (
              <div
                className="w-10 h-10 rounded-lg mb-2 border border-gray-100"
                style={{ backgroundColor: opt.swatch }}
              />
            )}
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create quiz page with all steps**

Create `src/app/quiz/page.tsx`:
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { determineSeason } from '@/lib/colorimetry/quiz-scoring'
import AuthGuard from '@/components/layout/AuthGuard'
import QuizStep from '@/components/quiz/QuizStep'
import QuizProgress from '@/components/quiz/QuizProgress'
import { QuizAnswers, SkinTone, Undertone, EyeColor, HairColor, ContrastLevel } from '@/types'

const STEPS = [
  {
    question: 'Quelle est ta carnation ?',
    subtitle: 'Choisis le ton de peau le plus proche du tien.',
    key: 'skin_tone' as const,
    options: [
      { value: 'fair', label: 'Claire', swatch: '#FDEBD0' },
      { value: 'medium', label: 'Moyenne', swatch: '#D4A574' },
      { value: 'deep', label: 'Foncée', swatch: '#8D5524' },
    ],
  },
  {
    question: 'Quel est ton sous-ton ?',
    subtitle: 'Regarde les veines de ton poignet : vertes = chaud, bleues = froid, mélangé = neutre.',
    key: 'undertone' as const,
    options: [
      { value: 'warm', label: 'Chaud (doré)', swatch: '#DAA520' },
      { value: 'cool', label: 'Froid (rosé)', swatch: '#DB7093' },
      { value: 'neutral', label: 'Neutre', swatch: '#C4A882' },
    ],
  },
  {
    question: 'Quelle est ta couleur d\'yeux ?',
    subtitle: 'Choisis la teinte la plus proche.',
    key: 'eye_color' as const,
    options: [
      { value: 'blue', label: 'Bleu', swatch: '#4682B4' },
      { value: 'green', label: 'Vert', swatch: '#2E8B57' },
      { value: 'hazel', label: 'Noisette', swatch: '#8B7355' },
      { value: 'brown', label: 'Marron', swatch: '#8B4513' },
      { value: 'dark-brown', label: 'Marron foncé', swatch: '#3B2314' },
    ],
  },
  {
    question: 'Quelle est ta couleur de cheveux naturelle ?',
    key: 'hair_color' as const,
    options: [
      { value: 'blonde', label: 'Blond', swatch: '#F5DEB3' },
      { value: 'light-brown', label: 'Châtain clair', swatch: '#C4A882' },
      { value: 'medium-brown', label: 'Châtain', swatch: '#8B7355' },
      { value: 'dark-brown', label: 'Brun', swatch: '#5C4033' },
      { value: 'black', label: 'Noir', swatch: '#1C1C1C' },
      { value: 'red', label: 'Roux', swatch: '#993333' },
    ],
  },
  {
    question: 'Quel est ton niveau de contraste ?',
    subtitle: 'Le contraste entre ta peau, tes yeux et tes cheveux.',
    key: 'contrast_level' as const,
    options: [
      { value: 'high', label: 'Fort (ex: peau claire + cheveux noirs)' },
      { value: 'medium', label: 'Moyen' },
      { value: 'low', label: 'Faible (ex: peau claire + cheveux blonds)' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  function handleSelect(value: string) {
    const key = STEPS[step].key
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  async function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      return
    }

    // Last step — compute result and save
    setLoading(true)
    const quizAnswers = answers as unknown as QuizAnswers
    const result = determineSeason(quizAnswers)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('quiz_results').insert({
      user_id: user.id,
      answers: quizAnswers,
      season_result: result.season,
      confidence: result.confidence,
    })

    await supabase.from('profiles').update({
      season: result.season,
      skin_tone: quizAnswers.skin_tone,
      eye_color: quizAnswers.eye_color,
      hair_color: quizAnswers.hair_color,
      contrast_level: quizAnswers.contrast_level,
    }).eq('id', user.id)

    router.push(`/result?season=${result.season}&confidence=${result.confidence}`)
  }

  const currentStep = STEPS[step]
  const canProceed = !!answers[currentStep.key]

  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto px-6 py-12">
        <QuizProgress step={step} total={STEPS.length} />
        <QuizStep
          question={currentStep.question}
          subtitle={currentStep.subtitle}
          options={currentStep.options}
          selected={answers[currentStep.key] || null}
          onSelect={handleSelect}
        />
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← Retour
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-30"
          >
            {loading ? 'Analyse...' : step === STEPS.length - 1 ? 'Voir mon résultat' : 'Suivant →'}
          </button>
        </div>
      </div>
    </AuthGuard>
  )
}
```

- [ ] **Step 4: Create result page**

Create `src/app/result/page.tsx`:
```tsx
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import { SeasonCode } from '@/types'
import AuthGuard from '@/components/layout/AuthGuard'
import { Suspense } from 'react'

function ResultContent() {
  const searchParams = useSearchParams()
  const seasonCode = searchParams.get('season') as SeasonCode
  const confidence = searchParams.get('confidence')

  if (!seasonCode) return <p>Aucun résultat trouvé.</p>

  const season = getSeasonByCode(seasonCode)

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      {/* Season badge */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-2xl p-8 text-center mb-8">
        <span className="text-5xl">{season.emoji}</span>
        <h1 className="text-3xl font-bold mt-4">{season.name}</h1>
        <p className="mt-2 text-gray-300">{season.description}</p>
        {confidence === 'medium' && (
          <p className="mt-3 text-xs text-gray-400 bg-white/10 rounded-full px-3 py-1 inline-block">
            Confiance moyenne — tu peux affiner avec une photo
          </p>
        )}
      </div>

      {/* Palette */}
      <h2 className="text-xl font-bold mb-4">Ta palette idéale</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {season.colors.map((color, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-lg border border-gray-100 shadow-sm cursor-default"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* Colors to avoid */}
      <h2 className="text-xl font-bold mb-4">Couleurs à éviter</h2>
      <div className="flex flex-wrap gap-2 mb-8">
        {season.avoid.map((color, i) => (
          <div key={i} className="relative">
            <div
              className="w-10 h-10 rounded-lg border border-gray-100 opacity-50"
              style={{ backgroundColor: color }}
              title={color}
            />
            <span className="absolute inset-0 flex items-center justify-center text-red-500 text-lg">✕</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Link
          href="/quiz/photo"
          className="flex-1 py-3 text-center border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          📸 Affiner avec photo
        </Link>
        <Link
          href="/avatar"
          className="flex-1 py-3 text-center bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          👤 Essayer l'avatar →
        </Link>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div>}>
        <ResultContent />
      </Suspense>
    </AuthGuard>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/quiz/ src/app/result/ src/components/quiz/
git commit -m "feat: add colorimetry quiz and result page"
```

---

## Task 5: Interactive Avatar Page

**Goal:** Build the main avatar page with clickable zones, color picker, and outfit suggestions.

**Files:**
- Create: `src/app/avatar/page.tsx`
- Create: `src/components/avatar/AvatarSvg.tsx`
- Create: `src/components/avatar/AvatarZone.tsx`
- Create: `src/components/avatar/ColorPicker.tsx`

**Acceptance Criteria:**
- [ ] Avatar renders with hair, top, bottom, shoes zones
- [ ] Clicking a zone highlights it and shows the color picker
- [ ] Selecting a color updates the avatar in real-time
- [ ] Outfit suggestions update when any color changes
- [ ] Hair color change triggers season recalculation with notification
- [ ] "Save outfit" button stores to Supabase

**Verify:** `npm run build` → no errors. Manual test: click zones, change colors, verify suggestions update.

**Steps:**

- [ ] **Step 1: Create AvatarZone component**

Create `src/components/avatar/AvatarZone.tsx`:
```tsx
interface AvatarZoneProps {
  id: string
  label: string
  isSelected: boolean
  onClick: () => void
  children: React.ReactNode
}

export default function AvatarZone({ id, label, isSelected, onClick, children }: AvatarZoneProps) {
  return (
    <g
      id={id}
      onClick={onClick}
      className="cursor-pointer"
      style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.3))' : undefined }}
    >
      {children}
    </g>
  )
}
```

- [ ] **Step 2: Create AvatarSvg component**

Create `src/components/avatar/AvatarSvg.tsx`:
```tsx
'use client'

import { AvatarState, AvatarZoneId, Gender } from '@/types'
import AvatarZone from './AvatarZone'

interface AvatarSvgProps {
  state: AvatarState
  skinTone: string
  gender: Gender
  selectedZone: AvatarZoneId | null
  onZoneClick: (zone: AvatarZoneId) => void
}

export default function AvatarSvg({ state, skinTone, gender, selectedZone, onZoneClick }: AvatarSvgProps) {
  const skin = skinTone || '#D4A574'

  return (
    <svg viewBox="0 0 220 440" className="w-full max-w-[220px] mx-auto">
      {/* Shadow */}
      <ellipse cx="110" cy="430" rx="50" ry="8" fill="rgba(0,0,0,0.06)" />

      {/* Hair zone */}
      <AvatarZone id="hair" label="Cheveux" isSelected={selectedZone === 'hair'} onClick={() => onZoneClick('hair')}>
        <path d="M74 45 Q70 15 90 8 Q110 2 130 8 Q150 15 146 45 Q148 30 152 42 L152 60 Q155 70 148 75 L142 60" fill={state.hair} />
        <path d="M74 45 L70 60 Q66 70 72 75 L78 60" fill={state.hair} />
      </AvatarZone>

      {/* Head */}
      <ellipse cx="110" cy="58" rx="32" ry="38" fill={skin} />
      <path d="M78 55 Q78 90 110 98 Q142 90 142 55" fill={skin} />

      {/* Ears */}
      <ellipse cx="76" cy="58" rx="5" ry="8" fill={skin} />
      <ellipse cx="144" cy="58" rx="5" ry="8" fill={skin} />

      {/* Eyes */}
      <ellipse cx="96" cy="55" rx="6" ry="5" fill="white" />
      <ellipse cx="124" cy="55" rx="6" ry="5" fill="white" />
      <circle cx="97" cy="55" r="3.5" fill="#3D2B1F" />
      <circle cx="125" cy="55" r="3.5" fill="#3D2B1F" />
      <circle cx="99" cy="53" r="1" fill="white" />
      <circle cx="127" cy="53" r="1" fill="white" />

      {/* Eyebrows */}
      <path d="M88 45 Q95 41 103 44" stroke={state.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M117 44 Q125 41 132 45" stroke={state.hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Nose + Mouth */}
      <path d="M107 58 Q109 67 107 71 Q105 74 110 75 Q115 74 113 71" stroke={skin} strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M100 82 Q110 89 120 82" stroke="#C27070" strokeWidth="2" fill="#D4878F" />

      {/* Neck */}
      <rect x="98" y="94" width="24" height="16" rx="8" fill={skin} />

      {/* Top zone */}
      <AvatarZone id="top" label="Haut" isSelected={selectedZone === 'top'} onClick={() => onZoneClick('top')}>
        <path
          d="M72 110 Q65 108 55 115 L38 135 L50 143 L68 126 L68 210 Q68 215 73 215 L147 215 Q152 215 152 210 L152 126 L170 143 L182 135 L165 115 Q155 108 148 110 L135 107 Q120 102 110 102 Q100 102 85 107 Z"
          fill={state.top}
        />
        <path d="M92 102 Q100 108 110 102 Q120 108 128 102" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" />
      </AvatarZone>

      {/* Hands */}
      <circle cx="38" cy="138" r="8" fill={skin} />
      <circle cx="182" cy="138" r="8" fill={skin} />

      {/* Bottom zone */}
      <AvatarZone id="bottom" label="Bas" isSelected={selectedZone === 'bottom'} onClick={() => onZoneClick('bottom')}>
        <path d="M72 215 L68 335 Q68 340 75 340 L105 340 Q108 340 108 335 L105 215 Z" fill={state.bottom} />
        <path d="M115 215 L112 335 Q112 340 118 340 L145 340 Q152 340 152 335 L148 215 Z" fill={state.bottom} />
        <line x1="88" y1="220" x2="86" y2="335" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
        <line x1="132" y1="220" x2="130" y2="335" stroke="rgba(0,0,0,0.08)" strokeWidth="0.8" />
      </AvatarZone>

      {/* Shoes zone */}
      <AvatarZone id="shoes" label="Chaussures" isSelected={selectedZone === 'shoes'} onClick={() => onZoneClick('shoes')}>
        <path d="M60 336 L108 336 Q113 336 113 341 L113 352 Q113 358 108 358 L65 358 Q60 358 60 352 Z" fill={state.shoes} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
        <path d="M107 336 L152 336 Q157 336 157 341 L157 352 Q157 358 152 358 L112 358 Q107 358 107 352 Z" fill={state.shoes} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      </AvatarZone>
    </svg>
  )
}
```

- [ ] **Step 3: Create ColorPicker component**

Create `src/components/avatar/ColorPicker.tsx`:
```tsx
'use client'

import { AvatarZoneId } from '@/types'

interface ColorPickerProps {
  zone: AvatarZoneId
  colors: string[]
  selectedColor: string
  onColorSelect: (color: string) => void
}

const ZONE_LABELS: Record<AvatarZoneId, string> = {
  hair: 'Cheveux',
  top: 'Haut',
  bottom: 'Bas',
  shoes: 'Chaussures',
}

export default function ColorPicker({ zone, colors, selectedColor, onColorSelect }: ColorPickerProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Zone sélectionnée</p>
      <p className="text-lg font-bold mb-4">{ZONE_LABELS[zone]}</p>
      <p className="text-sm text-gray-500 mb-3">
        {zone === 'hair' ? 'Couleurs de cheveux réalistes :' : 'Couleurs recommandées :'}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, i) => (
          <button
            key={i}
            onClick={() => onColorSelect(color)}
            className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
              selectedColor === color ? 'border-black scale-110 shadow-md' : 'border-gray-100'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create avatar page**

Create `src/app/avatar/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import { suggestOutfits } from '@/lib/colorimetry/color-combinations'
import { recalculateSeasonForHair } from '@/lib/colorimetry/hair-recalculation'
import AuthGuard from '@/components/layout/AuthGuard'
import AvatarSvg from '@/components/avatar/AvatarSvg'
import ColorPicker from '@/components/avatar/ColorPicker'
import { AvatarState, AvatarZoneId, SeasonCode, Profile, QuizAnswers } from '@/types'

const SKIN_HEX: Record<string, string> = {
  'fair': '#FDEBD0',
  'medium': '#D4A574',
  'deep': '#8D5524',
}

const HAIR_HEX: Record<string, string> = {
  'blonde': '#F5DEB3',
  'light-brown': '#C4A882',
  'medium-brown': '#8B7355',
  'dark-brown': '#5C4033',
  'black': '#1C1C1C',
  'red': '#993333',
}

export default function AvatarPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null)
  const [seasonCode, setSeasonCode] = useState<SeasonCode | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<AvatarZoneId | null>(null)
  const [avatarState, setAvatarState] = useState<AvatarState>({
    hair: '#1C1C1C',
    top: '#B8D4E3',
    bottom: '#2C3E6B',
    shoes: '#333333',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        if (profileData.season) setSeasonCode(profileData.season as SeasonCode)
        if (profileData.hair_color) {
          setAvatarState(prev => ({
            ...prev,
            hair: HAIR_HEX[profileData.hair_color] || '#1C1C1C',
          }))
        }
      }

      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('answers')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (quizData) setQuizAnswers(quizData.answers as QuizAnswers)
    }
    load()
  }, [])

  const season = seasonCode ? getSeasonByCode(seasonCode) : null

  function handleColorSelect(color: string) {
    if (!selectedZone) return

    setAvatarState(prev => ({ ...prev, [selectedZone]: color }))

    // Hair color change → recalculate season
    if (selectedZone === 'hair' && quizAnswers) {
      const result = recalculateSeasonForHair(quizAnswers, color)
      if (result.changed) {
        setSeasonCode(result.season)
        const newSeason = getSeasonByCode(result.season)
        setNotification(`Avec cette couleur de cheveux, ta palette passe à ${newSeason.emoji} ${newSeason.name}`)
        setTimeout(() => setNotification(null), 5000)
      }
    }
  }

  async function handleSaveOutfit() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('outfits').insert({
      user_id: user.id,
      hair_color: avatarState.hair,
      top_color: avatarState.top,
      bottom_color: avatarState.bottom,
      shoes_color: avatarState.shoes,
    })

    setNotification('Tenue sauvegardée ! 👗')
    setTimeout(() => setNotification(null), 3000)
  }

  const colorsForPicker = selectedZone && season
    ? selectedZone === 'hair' ? season.hairColors : season.colors
    : []

  const suggestions = selectedZone && selectedZone !== 'hair' && season
    ? suggestOutfits(selectedZone, avatarState[selectedZone], season)
    : []

  if (!season) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <p className="text-gray-500 mb-4">Tu n'as pas encore fait le quiz colorimétrie.</p>
          <a href="/quiz" className="px-6 py-3 bg-black text-white rounded-xl font-medium">
            Faire le quiz →
          </a>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Notification */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50 animate-pulse">
            {notification}
          </div>
        )}

        {/* Season badge */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl px-6 py-4 mb-8 flex items-center gap-4">
          <span className="text-3xl">{season.emoji}</span>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Ta saison</p>
            <p className="text-xl font-bold">{season.name}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0 md:w-[280px]">
            <div className="bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl p-6">
              <AvatarSvg
                state={avatarState}
                skinTone={SKIN_HEX[profile?.skin_tone || 'medium']}
                gender={profile?.gender || 'male'}
                selectedZone={selectedZone}
                onZoneClick={setSelectedZone}
              />
              <p className="text-center text-xs text-gray-400 mt-4">Clique sur une zone pour changer sa couleur</p>
            </div>
            <button
              onClick={handleSaveOutfit}
              className="w-full mt-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              💾 Sauvegarder cette tenue
            </button>
          </div>

          {/* Right panel */}
          <div className="flex-1 space-y-6">
            {selectedZone ? (
              <>
                <ColorPicker
                  zone={selectedZone}
                  colors={colorsForPicker}
                  selectedColor={avatarState[selectedZone]}
                  onColorSelect={handleColorSelect}
                />

                {suggestions.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">💡 Suggestions de tenues</p>
                    <div className="space-y-4">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setAvatarState(prev => ({
                            ...prev,
                            top: s.top,
                            bottom: s.bottom,
                            shoes: s.shoes,
                          }))}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex gap-1">
                            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: s.top }} />
                            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: s.bottom }} />
                            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: s.shoes }} />
                          </div>
                          <span className="text-sm text-gray-600">{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-gray-400">
                <p className="text-4xl mb-3">👈</p>
                <p>Clique sur une zone de l'avatar pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/avatar/ src/components/avatar/
git commit -m "feat: add interactive avatar with color picker and outfit suggestions"
```

---

## Task 6: Wardrobe Page

**Goal:** Build the wardrobe page to display saved outfits with favorites and sharing.

**Files:**
- Create: `src/app/wardrobe/page.tsx`
- Create: `src/components/wardrobe/OutfitCard.tsx`
- Create: `src/components/wardrobe/OutfitGrid.tsx`

**Acceptance Criteria:**
- [ ] Lists all saved outfits as mini-avatar thumbnails
- [ ] Toggle favorite on each outfit
- [ ] Delete outfit
- [ ] Share button copies a link / generates a shareable image
- [ ] Empty state if no outfits saved

**Verify:** `npm run build` → no errors

**Steps:**

- [ ] **Step 1: Create OutfitCard component**

Create `src/components/wardrobe/OutfitCard.tsx`:
```tsx
'use client'

import { Outfit } from '@/types'

interface OutfitCardProps {
  outfit: Outfit
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export default function OutfitCard({ outfit, onToggleFavorite, onDelete }: OutfitCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      {/* Mini avatar preview */}
      <svg viewBox="0 0 120 240" className="w-full h-40 mx-auto">
        <ellipse cx="60" cy="230" rx="30" ry="5" fill="rgba(0,0,0,0.05)" />
        {/* Hair */}
        <ellipse cx="60" cy="22" rx="20" ry="14" fill={outfit.hair_color} />
        {/* Head */}
        <circle cx="60" cy="30" r="18" fill="#D4A574" />
        {/* Eyes */}
        <circle cx="54" cy="28" r="2" fill="#333" />
        <circle cx="66" cy="28" r="2" fill="#333" />
        {/* Top */}
        <rect x="38" y="50" width="44" height="55" rx="8" fill={outfit.top_color} />
        {/* Arms */}
        <rect x="25" y="52" width="13" height="35" rx="6" fill={outfit.top_color} />
        <rect x="82" y="52" width="13" height="35" rx="6" fill={outfit.top_color} />
        {/* Bottom */}
        <rect x="38" y="105" width="18" height="65" rx="6" fill={outfit.bottom_color} />
        <rect x="64" y="105" width="18" height="65" rx="6" fill={outfit.bottom_color} />
        {/* Shoes */}
        <ellipse cx="47" cy="175" rx="12" ry="5" fill={outfit.shoes_color} />
        <ellipse cx="73" cy="175" rx="12" ry="5" fill={outfit.shoes_color} />
      </svg>

      {/* Actions */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">
          {new Date(outfit.created_at).toLocaleDateString('fr-FR')}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleFavorite(outfit.id)}
            className="text-lg hover:scale-125 transition-transform"
          >
            {outfit.is_favorite ? '⭐' : '☆'}
          </button>
          <button
            onClick={() => onDelete(outfit.id)}
            className="text-lg hover:scale-125 transition-transform text-gray-300 hover:text-red-400"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create OutfitGrid component**

Create `src/components/wardrobe/OutfitGrid.tsx`:
```tsx
import { Outfit } from '@/types'
import OutfitCard from './OutfitCard'

interface OutfitGridProps {
  outfits: Outfit[]
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
}

export default function OutfitGrid({ outfits, onToggleFavorite, onDelete }: OutfitGridProps) {
  if (outfits.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">👗</p>
        <p className="text-gray-400">Aucune tenue sauvegardée</p>
        <a href="/avatar" className="mt-4 inline-block px-6 py-2 bg-black text-white rounded-xl text-sm">
          Créer une tenue →
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {outfits.map(outfit => (
        <OutfitCard
          key={outfit.id}
          outfit={outfit}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Create wardrobe page**

Create `src/app/wardrobe/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AuthGuard from '@/components/layout/AuthGuard'
import OutfitGrid from '@/components/wardrobe/OutfitGrid'
import { Outfit } from '@/types'

export default function WardrobePage() {
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOutfits(data)
    }
    load()
  }, [])

  async function handleToggleFavorite(id: string) {
    const outfit = outfits.find(o => o.id === id)
    if (!outfit) return

    const supabase = createClient()
    await supabase.from('outfits').update({ is_favorite: !outfit.is_favorite }).eq('id', id)
    setOutfits(prev => prev.map(o => o.id === id ? { ...o, is_favorite: !o.is_favorite } : o))
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('outfits').delete().eq('id', id)
    setOutfits(prev => prev.filter(o => o.id !== id))
  }

  const filtered = filter === 'favorites' ? outfits.filter(o => o.is_favorite) : outfits

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Garde-robe</h1>
          <div className="flex gap-2">
            {(['all', 'favorites'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  filter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Toutes' : '⭐ Favoris'}
              </button>
            ))}
          </div>
        </div>
        <OutfitGrid
          outfits={filtered}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      </div>
    </AuthGuard>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/wardrobe/ src/components/wardrobe/
git commit -m "feat: add wardrobe page with outfit grid, favorites, and delete"
```

---

## Task 7: Photo Analysis Page

**Goal:** Build the photo upload page that extracts colors from a selfie to refine the season.

**Files:**
- Create: `src/app/quiz/photo/page.tsx`
- Create: `src/components/quiz/PhotoAnalyzer.tsx`
- Create: `src/lib/colorimetry/photo-analysis.ts`

**Acceptance Criteria:**
- [ ] User can upload a photo or take one from camera
- [ ] Client-side Canvas API extracts dominant colors from face area
- [ ] Extracted colors are compared to season profiles
- [ ] Result shows refined season (or confirms current one)

**Verify:** `npm run build` → no errors

**Steps:**

- [ ] **Step 1: Create photo analysis utility**

Create `src/lib/colorimetry/photo-analysis.ts`:
```typescript
import { SeasonCode } from '@/types'
import { SEASONS } from './seasons'

interface ExtractedColors {
  skin: string
  dominantHue: number
  dominantSaturation: number
  dominantLightness: number
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: h * 360, s, l }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
}

export function extractColorsFromImage(canvas: HTMLCanvasElement): ExtractedColors {
  const ctx = canvas.getContext('2d')!
  const width = canvas.width
  const height = canvas.height

  // Sample center region (face area approximation)
  const centerX = Math.floor(width * 0.3)
  const centerY = Math.floor(height * 0.2)
  const sampleW = Math.floor(width * 0.4)
  const sampleH = Math.floor(height * 0.4)

  const imageData = ctx.getImageData(centerX, centerY, sampleW, sampleH)
  const pixels = imageData.data

  let totalR = 0, totalG = 0, totalB = 0, count = 0

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
    // Skip very dark or very bright pixels (likely background/hair)
    const { l } = rgbToHsl(r, g, b)
    if (l > 0.15 && l < 0.85) {
      totalR += r; totalG += g; totalB += b; count++
    }
  }

  const avgR = Math.round(totalR / count)
  const avgG = Math.round(totalG / count)
  const avgB = Math.round(totalB / count)
  const { h, s, l } = rgbToHsl(avgR, avgG, avgB)

  return {
    skin: rgbToHex(avgR, avgG, avgB),
    dominantHue: h,
    dominantSaturation: s,
    dominantLightness: l,
  }
}

export function refineSeasonFromPhoto(
  currentSeason: SeasonCode,
  extracted: ExtractedColors
): { season: SeasonCode; changed: boolean } {
  const current = SEASONS[currentSeason]

  // Check if undertone matches current season
  const isWarm = extracted.dominantHue >= 15 && extracted.dominantHue <= 50
  const currentIsWarm = current.characteristics.warmth === 'warm'

  // If undertone matches, keep current season
  if (isWarm === currentIsWarm) {
    return { season: currentSeason, changed: false }
  }

  // Find best matching season with opposite warmth
  const targetWarmth = isWarm ? 'warm' : 'cool'
  const targetDepth = current.characteristics.depth
  const targetClarity = current.characteristics.clarity

  const match = Object.values(SEASONS).find(s =>
    s.characteristics.warmth === targetWarmth &&
    s.characteristics.depth === targetDepth
  )

  if (match) {
    return { season: match.code, changed: match.code !== currentSeason }
  }

  return { season: currentSeason, changed: false }
}
```

- [ ] **Step 2: Create PhotoAnalyzer component**

Create `src/components/quiz/PhotoAnalyzer.tsx`:
```tsx
'use client'

import { useRef, useState } from 'react'
import { extractColorsFromImage, refineSeasonFromPhoto } from '@/lib/colorimetry/photo-analysis'
import { SeasonCode } from '@/types'

interface PhotoAnalyzerProps {
  currentSeason: SeasonCode
  onResult: (season: SeasonCode, skinHex: string) => void
}

export default function PhotoAnalyzer({ currentSeason, onResult }: PhotoAnalyzerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const src = ev.target?.result as string
      setPreview(src)

      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current!
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        setAnalyzing(true)
        setTimeout(() => {
          const extracted = extractColorsFromImage(canvas)
          const result = refineSeasonFromPhoto(currentSeason, extracted)
          onResult(result.season, extracted.skin)
          setAnalyzing(false)
        }, 1000) // Small delay for UX
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {!preview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-16 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-gray-300 transition-colors"
        >
          <span className="text-4xl block mb-3">📸</span>
          <span className="text-gray-500">Clique pour uploader un selfie</span>
          <span className="block text-xs text-gray-400 mt-1">Lumière naturelle, pas de maquillage, cheveux visibles</span>
        </button>
      ) : (
        <div className="relative">
          <img src={preview} alt="Selfie" className="w-full max-w-sm mx-auto rounded-2xl" />
          {analyzing && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Analyse en cours...</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
```

- [ ] **Step 3: Create photo quiz page**

Create `src/app/quiz/photo/page.tsx`:
```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSeasonByCode } from '@/lib/colorimetry/seasons'
import AuthGuard from '@/components/layout/AuthGuard'
import PhotoAnalyzer from '@/components/quiz/PhotoAnalyzer'
import { SeasonCode } from '@/types'

export default function PhotoPage() {
  const router = useRouter()
  const [currentSeason, setCurrentSeason] = useState<SeasonCode | null>(null)
  const [result, setResult] = useState<{ season: SeasonCode; skinHex: string } | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('season')
        .eq('id', user.id)
        .single()

      if (data?.season) setCurrentSeason(data.season as SeasonCode)
    }
    load()
  }, [])

  async function handleResult(season: SeasonCode, skinHex: string) {
    setResult({ season, skinHex })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ season }).eq('id', user.id)
  }

  if (!currentSeason) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Fais d'abord le quiz avant d'uploader une photo.</p>
        </div>
      </AuthGuard>
    )
  }

  const season = result ? getSeasonByCode(result.season) : getSeasonByCode(currentSeason)
  const changed = result && result.season !== currentSeason

  return (
    <AuthGuard>
      <div className="max-w-lg mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Affine avec une photo</h1>
        <p className="text-gray-500 mb-8">Upload un selfie en lumière naturelle pour affiner ton résultat.</p>

        <PhotoAnalyzer currentSeason={currentSeason} onResult={handleResult} />

        {result && (
          <div className="mt-8">
            <div className={`p-6 rounded-2xl text-center ${changed ? 'bg-purple-50' : 'bg-green-50'}`}>
              <span className="text-4xl">{season.emoji}</span>
              <h2 className="text-2xl font-bold mt-2">{season.name}</h2>
              <p className="text-gray-500 mt-1">
                {changed
                  ? 'Ta saison a été ajustée grâce à la photo !'
                  : 'La photo confirme ton résultat du quiz ✓'}
              </p>
            </div>
            <button
              onClick={() => router.push('/avatar')}
              className="w-full mt-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Essayer l'avatar →
            </button>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/quiz/photo/ src/components/quiz/PhotoAnalyzer.tsx src/lib/colorimetry/photo-analysis.ts
git commit -m "feat: add photo analysis for season refinement"
```

---

## Task 8: Guide / Education Pages

**Goal:** Build the educational guide with articles about colorimetry.

**Files:**
- Create: `src/lib/guide/articles.ts`
- Create: `src/app/guide/page.tsx`
- Create: `src/app/guide/[slug]/page.tsx`

**Acceptance Criteria:**
- [ ] Guide index lists all articles with titles and descriptions
- [ ] Individual article pages render content
- [ ] Pages are accessible without authentication
- [ ] 5 articles covering colorimetry basics

**Verify:** `npm run build` → no errors. Navigate to `/guide` and click articles.

**Steps:**

- [ ] **Step 1: Create article content**

Create `src/lib/guide/articles.ts`:
```typescript
export interface Article {
  slug: string
  title: string
  description: string
  emoji: string
  content: string
}

export const ARTICLES: Article[] = [
  {
    slug: 'what-is-colorimetry',
    title: 'Qu\'est-ce que la colorimétrie ?',
    description: 'Comprendre les bases de l\'analyse des couleurs personnelles.',
    emoji: '🎨',
    content: `
La colorimétrie personnelle est une méthode qui permet de déterminer quelles couleurs vous mettent le plus en valeur, en fonction de vos caractéristiques naturelles : la couleur de votre peau, de vos yeux et de vos cheveux.

## Le principe

Chaque personne possède un "sous-ton" de peau, qui peut être chaud (doré, pêche), froid (rosé, bleuté) ou neutre. Ce sous-ton, combiné à la profondeur de vos couleurs naturelles et à votre niveau de contraste, détermine votre "saison" colorimétrique.

## Pourquoi c'est utile ?

Porter des couleurs qui correspondent à votre saison :
- **Illumine votre visage** et vous donne bonne mine
- **Harmonise votre apparence** de manière naturelle
- **Simplifie vos achats** : vous savez exactement quoi chercher
- **Réduit les erreurs** vestimentaires

## L'histoire

Ce système a été popularisé dans les années 1980 par Carole Jackson dans son livre "Color Me Beautiful". Depuis, il a été affiné en 12 sous-saisons pour plus de précision.
    `.trim(),
  },
  {
    slug: 'the-12-seasons',
    title: 'Les 12 saisons expliquées',
    description: 'Découvre chaque saison et ses caractéristiques.',
    emoji: '🌍',
    content: `
Le système des 12 saisons divise les profils colorimétriques en 4 familles (Printemps, Été, Automne, Hiver), chacune avec 3 variantes.

## 🌸 Famille Printemps (chaud + clair/vif)

- **Light Spring** : teintes pastel lumineuses, aspect frais et délicat
- **Warm Spring** : couleurs dorées et chaudes, tons pêche et corail
- **Bright Spring** : couleurs vives et saturées avec un éclat chaud

## 🌊 Famille Été (froid + doux)

- **Light Summer** : pastels frais, lavande et rose poudré
- **Cool Summer** : bleus et roses froids, gris subtils
- **Soft Summer** : couleurs atténuées et poudrées, tons grisés

## 🍂 Famille Automne (chaud + profond/doux)

- **Soft Autumn** : tons terre doux et poudrés
- **Warm Autumn** : rouille, olive, moutarde — couleurs chaudes et riches
- **Deep Autumn** : bordeaux, vert forêt, chocolat — couleurs profondes

## ❄️ Famille Hiver (froid + vif/profond)

- **Deep Winter** : contrastes forts, couleurs saturées et profondes
- **Cool Winter** : bleu glacier, fuchsia, argent — froids et vifs
- **Bright Winter** : couleurs éclatantes type pierres précieuses
    `.trim(),
  },
  {
    slug: 'color-wheel',
    title: 'La roue des couleurs',
    description: 'Comment fonctionnent les harmonies de couleurs.',
    emoji: '🔵',
    content: `
Comprendre la roue des couleurs vous aide à créer des tenues harmonieuses.

## Les harmonies de base

### Complémentaire
Deux couleurs opposées sur la roue (ex: bleu et orange). Crée un contraste fort et dynamique. Idéal pour les saisons à fort contraste (Winter).

### Analogue
Couleurs voisines sur la roue (ex: bleu, bleu-vert, vert). Crée une harmonie douce et naturelle. Parfait pour les saisons douces (Soft Summer, Soft Autumn).

### Triadique
Trois couleurs équidistantes sur la roue (ex: rouge, jaune, bleu). Donne un look coloré mais équilibré.

## Application aux tenues

- **Haut + bas complémentaires** : chemise bleu marine + pantalon rouille
- **Ton sur ton analogue** : différentes nuances de bleu
- **Accent triadique** : base neutre + deux accents colorés
    `.trim(),
  },
  {
    slug: 'contrast-and-harmony',
    title: 'Contraste et harmonie',
    description: 'Comment construire des tenues avec le bon niveau de contraste.',
    emoji: '⚖️',
    content: `
Le contraste dans une tenue doit refléter votre contraste naturel.

## Votre contraste naturel

- **Fort** : grande différence entre peau, yeux et cheveux (ex: peau claire + cheveux noirs)
- **Moyen** : différence modérée
- **Faible** : peu de différence (ex: peau claire + cheveux blonds)

## Règle d'or

Votre tenue devrait avoir un niveau de contraste similaire à votre contraste naturel.

- **Contraste fort** → portez des combinaisons comme noir/blanc, marine/crème
- **Contraste moyen** → associez des tons moyens, évitez les extrêmes
- **Contraste faible** → restez dans des tons proches, ton sur ton

## Exemples pratiques

Un Deep Winter (contraste fort) sera mis en valeur par une chemise blanche + pantalon noir.
Un Soft Summer (contraste faible) sera mieux dans un top lavande + pantalon gris clair.
    `.trim(),
  },
  {
    slug: 'common-mistakes',
    title: 'Erreurs courantes',
    description: 'Les pièges à éviter quand on choisit ses couleurs.',
    emoji: '⚠️',
    content: `
## 1. Confondre ce qu'on aime et ce qui nous va

On peut adorer le orange vif sans que ce soit dans notre palette. La solution : trouver la version de cette couleur qui correspond à votre saison.

## 2. Le noir ne va pas à tout le monde

Contrairement à la croyance populaire, le noir pur n'est flattering que pour les saisons Winter. Les autres saisons gagnent à le remplacer par du bleu marine, du gris anthracite ou du marron foncé.

## 3. Ignorer le sous-ton

Un rouge chaud (orangé) et un rouge froid (bleuté) sont très différents. Choisir le mauvais sous-ton peut ternir le teint même si la couleur semble "bonne".

## 4. Trop de couleurs vives

Même pour les saisons Bright, une tenue entièrement composée de couleurs vives fatigue l'œil. Utilisez une base neutre et ajoutez 1-2 couleurs de votre palette.

## 5. Négliger les accessoires

Les couleurs près du visage (écharpe, col, boucles d'oreilles) ont le plus d'impact. C'est là que votre palette compte le plus.
    `.trim(),
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find(a => a.slug === slug)
}
```

- [ ] **Step 2: Create guide index page**

Create `src/app/guide/page.tsx`:
```tsx
import Link from 'next/link'
import { ARTICLES } from '@/lib/guide/articles'

export default function GuidePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Guide colorimétrie</h1>
      <p className="text-gray-500 mb-8">Apprends à maîtriser les couleurs qui te mettent en valeur.</p>
      <div className="space-y-3">
        {ARTICLES.map(article => (
          <Link
            key={article.slug}
            href={`/guide/${article.slug}`}
            className="block p-5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{article.emoji}</span>
              <div>
                <h2 className="font-semibold">{article.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{article.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create individual article page**

Create `src/app/guide/[slug]/page.tsx`:
```tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug, ARTICLES } from '@/lib/guide/articles'

export function generateStaticParams() {
  return ARTICLES.map(a => ({ slug: a.slug }))
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  // Simple markdown-like rendering (split by ## for sections)
  const sections = article.content.split(/\n## /).map((section, i) => {
    if (i === 0) return <p key={i} className="text-gray-600 leading-relaxed whitespace-pre-line">{section}</p>
    const [title, ...body] = section.split('\n')
    return (
      <div key={i} className="mt-8">
        <h2 className="text-xl font-bold mb-3">{title}</h2>
        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
          {body.join('\n').split('\n### ').map((sub, j) => {
            if (j === 0) return <span key={j}>{sub}</span>
            const [subTitle, ...subBody] = sub.split('\n')
            return (
              <div key={j} className="mt-4">
                <h3 className="text-lg font-semibold mb-1">{subTitle}</h3>
                <span>{subBody.join('\n')}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  })

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/guide" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← Retour au guide
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{article.emoji}</span>
        <h1 className="text-3xl font-bold">{article.title}</h1>
      </div>
      <div>{sections}</div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/guide/ src/app/guide/
git commit -m "feat: add educational guide with 5 colorimetry articles"
```

---

## Task 9: Final Polish & Build Verification

**Goal:** Final verification, responsive testing, and cleanup.

**Files:**
- Modify: `src/app/globals.css` (if needed for any polish)

**Acceptance Criteria:**
- [ ] `npm run build` succeeds with zero errors
- [ ] All pages render correctly
- [ ] Mobile layout works (bottom nav, responsive grids)
- [ ] Desktop layout works (sidebar nav, wider content)

**Verify:**

```bash
npm run build
npm run start
```

Then test all routes:
1. `/` — landing page renders
2. `/signup` → `/login` — auth flow works
3. `/quiz` — all 5 steps work
4. `/result` — season displays
5. `/quiz/photo` — photo upload works
6. `/avatar` — zones clickable, colors change, suggestions show
7. `/wardrobe` — outfits display
8. `/guide` — articles list and individual pages

**Steps:**

- [ ] **Step 1: Run build and fix any errors**

```bash
npm run build
```

Fix any TypeScript or build errors found.

- [ ] **Step 2: Test responsive layout**

Run `npm run dev`, test at 375px and 1440px viewport.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Dress Claude v1 complete — colorimetry quiz, avatar, wardrobe, guide"
```
