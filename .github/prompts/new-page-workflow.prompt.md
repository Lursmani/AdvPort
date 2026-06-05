---
description: "Plan or implement a new localized page in AdvPort"
argument-hint: "Describe the route, purpose, sections, and translation needs"
agent: "agent"
---

Use the AdvPort page-creation guidance to plan or implement a new localized page.

Requirements:

- Keep routing under `src/app/[locale]/...`
- Reuse the existing section composition patterns
- Update locale catalogs in sync
- Call out header/navigation implications if route-level navigation changes
- Prefer shared repo patterns over creating new abstractions
