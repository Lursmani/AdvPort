---
name: update-translations
description: "Update AdvPort locale messages safely. Use for editing next-intl message catalogs, adding or renaming translation keys, keeping en/nl/ka shapes synchronized, and preserving locale-switch routing behavior."
argument-hint: "Describe the namespace or translation change"
---

# Update Translations

Use this skill when editing `messages/*.json` or changing locale-routing behavior.

## Procedure

1. Read `docs/ai/translations-and-routing.md`.
2. Update `messages/en.json`, `messages/nl.json`, and `messages/ka.json` together.
3. Preserve catalog shape consistency across all locales.
4. If locale switching is affected, preserve query-string and hash-fragment behavior.
5. If route-level locale handling is affected, preserve `generateStaticParams()`, awaited locale validation, and `setRequestLocale()` behavior.
6. Validate against `tests/translations-sync.test.ts`.

## Canonical References

- `docs/ai/translations-and-routing.md`
- `src/app/[locale]/layout.tsx`
- `src/i18n/routing.ts`
- `src/i18n/request.ts`
- `src/components/LanguageSwitcher.tsx`
- `src/components/LanguageSwitcherUtils.ts`
- `tests/translations-sync.test.ts`
