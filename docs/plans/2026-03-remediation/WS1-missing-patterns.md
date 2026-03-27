# WS1: Missing Patterns

## Problem

The `gaming-community` archetype (and others) reference 5 patterns that don't exist in `content/patterns/`:

| Pattern | Referenced By | Current State |
|---------|--------------|---------------|
| `hero` | gaming-community, portfolio, marketing-landing | Only in `content/core/patterns/` |
| `leaderboard` | gaming-community (3 pages) | Does not exist |
| `post-list` | gaming-community (news page) | Does not exist |
| `stats-bar` | gaming-community (hall-of-fame) | Does not exist |
| `timeline` | gaming-community (2 pages) | Does not exist |

## Impact

When an AI attempts to implement these patterns, it:
1. Cannot find pattern spec via `decantr get pattern <name>`
2. Invents its own implementation (inconsistent)
3. Has no presets or layout guidance

## Solution

Create pattern definitions in `content/patterns/` following the existing pattern schema.

## Files to Create

### 1. `content/patterns/hero.json`

Copy from `content/core/patterns/hero.json` to main patterns directory (or move it).

### 2. `content/patterns/leaderboard.json`

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "leaderboard",
  "version": "1.0.0",
  "name": "Leaderboard",
  "description": "Ranked list of items with position, avatar, name, and score. Supports spotlight, ranked, and grid presets.",
  "tags": ["gaming", "ranking", "scores", "competition", "social"],
  "classification": {
    "triggers": ["leaderboard", "ranking", "top players", "high scores", "standings"],
    "tier": "recommended"
  },
  "presets": {
    "spotlight": {
      "description": "Top 3 highlighted with large cards, rest in compact list",
      "layout": { "top": "cards", "rest": "list" }
    },
    "ranked": {
      "description": "Full ranked list with position numbers and progress indicators",
      "layout": { "style": "numbered-list", "showChange": true }
    },
    "grid": {
      "description": "Card grid for achievements or badges display",
      "layout": { "style": "grid", "columns": 3 }
    }
  },
  "slots": {
    "position": { "type": "number", "required": true },
    "avatar": { "type": "image", "required": false },
    "name": { "type": "text", "required": true },
    "score": { "type": "number", "required": true },
    "change": { "type": "delta", "required": false },
    "badge": { "type": "image", "required": false }
  },
  "layout": {
    "container": "section",
    "header": ["title", "filter?"],
    "body": ["items"],
    "footer": ["pagination?", "view-all?"]
  }
}
```

### 3. `content/patterns/post-list.json`

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "post-list",
  "version": "1.0.0",
  "name": "Post List",
  "description": "Chronological list of posts, articles, or news items with author, date, and preview.",
  "tags": ["content", "news", "blog", "feed", "articles"],
  "classification": {
    "triggers": ["news feed", "blog posts", "articles", "announcements", "updates"],
    "tier": "recommended"
  },
  "presets": {
    "default": {
      "description": "Standard post list with thumbnails",
      "layout": { "style": "list", "showThumbnail": true }
    },
    "compact": {
      "description": "Dense list without thumbnails",
      "layout": { "style": "list", "showThumbnail": false }
    },
    "cards": {
      "description": "Card-based layout for featured posts",
      "layout": { "style": "cards", "columns": 2 }
    }
  },
  "slots": {
    "title": { "type": "text", "required": true },
    "excerpt": { "type": "text", "required": false },
    "author": { "type": "user", "required": false },
    "date": { "type": "datetime", "required": true },
    "thumbnail": { "type": "image", "required": false },
    "category": { "type": "tag", "required": false },
    "readTime": { "type": "duration", "required": false }
  },
  "layout": {
    "container": "section",
    "header": ["title", "filter?"],
    "body": ["posts"],
    "footer": ["load-more?", "pagination?"]
  }
}
```

### 4. `content/patterns/stats-bar.json`

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "stats-bar",
  "version": "1.0.0",
  "name": "Stats Bar",
  "description": "Horizontal bar of key statistics or metrics. Compact summary row.",
  "tags": ["metrics", "stats", "summary", "kpi", "dashboard"],
  "classification": {
    "triggers": ["stats summary", "metrics bar", "key numbers", "totals"],
    "tier": "recommended"
  },
  "presets": {
    "default": {
      "description": "Equal-width stat items in a row",
      "layout": { "distribution": "equal" }
    },
    "compact": {
      "description": "Minimal padding, inline separators",
      "layout": { "distribution": "auto", "separator": "divider" }
    },
    "highlighted": {
      "description": "First stat emphasized, rest secondary",
      "layout": { "distribution": "featured-first" }
    }
  },
  "slots": {
    "items": {
      "type": "array",
      "item": {
        "label": { "type": "text", "required": true },
        "value": { "type": "number", "required": true },
        "unit": { "type": "text", "required": false },
        "trend": { "type": "delta", "required": false }
      }
    }
  },
  "layout": {
    "container": "div",
    "direction": "horizontal",
    "alignment": "center"
  }
}
```

### 5. `content/patterns/timeline.json`

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "timeline",
  "version": "1.0.0",
  "name": "Timeline",
  "description": "Chronological sequence of events with dates, descriptions, and optional media.",
  "tags": ["history", "events", "chronology", "activity", "milestones"],
  "classification": {
    "triggers": ["timeline", "history", "milestones", "event log", "journey"],
    "tier": "recommended"
  },
  "presets": {
    "default": {
      "description": "Vertical timeline with alternating sides",
      "layout": { "orientation": "vertical", "alternating": true }
    },
    "compact": {
      "description": "Single-side vertical timeline",
      "layout": { "orientation": "vertical", "alternating": false }
    },
    "horizontal": {
      "description": "Horizontal scrolling timeline",
      "layout": { "orientation": "horizontal" }
    }
  },
  "slots": {
    "events": {
      "type": "array",
      "item": {
        "date": { "type": "datetime", "required": true },
        "title": { "type": "text", "required": true },
        "description": { "type": "text", "required": false },
        "icon": { "type": "icon", "required": false },
        "media": { "type": "image", "required": false }
      }
    }
  },
  "layout": {
    "container": "section",
    "header": ["title?"],
    "body": ["events"],
    "connector": "line"
  }
}
```

## Validation

After creating patterns, verify:

```bash
# Each pattern should be findable
npx decantr get pattern hero
npx decantr get pattern leaderboard
npx decantr get pattern post-list
npx decantr get pattern stats-bar
npx decantr get pattern timeline

# Search should return them
npx decantr search leaderboard
```

## Checklist

- [ ] Move/copy `hero.json` from `content/core/patterns/` to `content/patterns/`
- [ ] Create `content/patterns/leaderboard.json`
- [ ] Create `content/patterns/post-list.json`
- [ ] Create `content/patterns/stats-bar.json`
- [ ] Create `content/patterns/timeline.json`
- [ ] Verify all patterns with `decantr get pattern <name>`
- [ ] Run existing tests: `pnpm test`
- [ ] Commit with message: `feat(content): add missing patterns (hero, leaderboard, post-list, stats-bar, timeline)`
