# Decantr UTM Taxonomy

This taxonomy keeps Decantr marketing-web telemetry useful before paid acquisition volume grows. Use it for public launches, social posts, newsletter links, partner links, docs links, and product-led experiments that hand traffic to `decantr.ai` or `registry.decantr.ai`.

Telemetry stores UTM values, landing path, referrer domain, click-id provider, and whether an ad click id was present. It does not store raw click ids, raw referrer URLs, emails, prompts, source code, file paths, or user agents.

## Required Fields

Every intentional campaign link should include:

```text
utm_source=
utm_medium=
utm_campaign=
utm_content=
```

Use `utm_term` only for search intent or explicit audience/keyword tests. Use `utm_id` only when an ad platform or launch calendar has a durable campaign id.

## Source Values

Prefer lowercase source names:

| Source | Use for |
| --- | --- |
| `x` | X/Twitter posts and ads |
| `linkedin` | LinkedIn posts and ads |
| `github` | GitHub README, releases, issues, discussions |
| `npm` | npm package pages or release copy |
| `docs` | Decantr docs or reference pages |
| `discord` | Discord community/server links |
| `newsletter` | Email newsletter links |
| `partner` | Partner or customer-shared links |
| `direct` | Manually shared links where the channel is known but not platform-specific |

## Medium Values

| Medium | Use for |
| --- | --- |
| `organic-social` | Unpaid social posts |
| `paid-social` | Paid social campaigns |
| `community` | Community/forum/chat links |
| `docs` | Documentation links |
| `package-registry` | npm/package registry traffic |
| `referral` | Partner/customer referrals |
| `email` | Newsletter or direct email |
| `launch` | Coordinated launch surfaces |

## Campaign Naming

Campaigns should be stable, descriptive, and date-scoped when useful:

```text
launch-project-health
launch-private-registries
v2-essence4
founder-led-demo
weekly-build-log-2026-05
```

Keep campaign names lowercase kebab-case. Do not put user emails, account names, private customer names, raw experiment notes, or ad click ids in campaign names.

## Content Naming

Use `utm_content` to identify the exact creative or placement:

```text
hero-cta
registry-cta
install-command
project-health-card
thread-1
founder-post
```

For A/B tests, suffix the creative:

```text
hero-cta-a
hero-cta-b
```

## Link Examples

Launch post to Decantr:

```text
https://decantr.ai/?utm_source=x&utm_medium=organic-social&utm_campaign=launch-project-health&utm_content=founder-post
```

Registry handoff:

```text
https://registry.decantr.ai/browse?utm_source=x&utm_medium=organic-social&utm_campaign=launch-project-health&utm_content=registry-cta
```

npm release note:

```text
https://decantr.ai/?utm_source=npm&utm_medium=package-registry&utm_campaign=v2-essence4&utm_content=readme-link
```

## QA Commands

Before or after a launch, run:

```bash
pnpm telemetry:marketing-qa
pnpm telemetry:marketing-qa -- --send-smoke
```

The first command checks that the public marketing and registry surfaces load the analytics assets. The smoke variant also posts one test `marketing_web.page_viewed` event to first-party ingest and expects `202`.

## Reading The Results

In PostHog and `/admin/telemetry/usage`, prioritize:

- Campaign-attributed marketing events
- Landing-attributed marketing events
- CTA clicks by campaign
- Registry follow-through from attributed sessions
- Signup/API-key intent after attributed registry sessions

The PostHog operating dashboard should include campaign acquisition, landing-path acquisition, and campaign registry follow-through insights. Refresh it with:

```bash
pnpm telemetry:posthog-dashboard
```

Treat `uncategorized` campaigns as a hygiene bug unless the traffic is truly organic/referrer-only.
