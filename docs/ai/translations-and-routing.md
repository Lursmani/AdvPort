# Translations and Locale Routing

Use this guide when editing routes, locale handling, or message catalogs.

## Locale Setup

The supported locales are defined in `src/i18n/config.ts`:

- `en`
- `nl`
- `ka`

`src/i18n/routing.ts` configures `next-intl` with `localePrefix: "always"`, so URLs must remain locale-prefixed.

## Request and Layout Flow

`src/i18n/request.ts` loads locale message catalogs.

`src/app/[locale]/layout.tsx` is the canonical locale boundary and must:

- await `params`
- validate `params.locale`
- call `setRequestLocale(locale)`
- export `generateStaticParams()` for all locales
- wrap children with `NextIntlClientProvider`

If you change locale routing behavior, preserve these guarantees unless you intentionally redesign the app’s routing architecture.

## Message Catalogs

Catalogs live in:

- `messages/en.json`
- `messages/nl.json`
- `messages/ka.json`

All catalogs must have the same shape.

`tests/translations-sync.test.ts` compares the catalogs and reports:

- missing keys
- extra keys
- type mismatches

When adding copy, update all locale files in the same change.

## Message Organization

Group messages by feature or component namespace.

Examples:

- `Header`
- `SkillsSection`
- `ExperienceSection`

For new routes or sections, create a stable top-level namespace and keep nested objects predictable.

## Locale Switching

The language switcher preserves query strings and hash fragments.

References:

- `src/components/LanguageSwitcher.tsx`
- `src/components/LanguageSwitcherUtils.ts`

Important details:

- search params are rebuilt with a null-prototype object for safety
- hash fragments are restored after locale replacement because locale navigation drops the fragment
- do not replace this logic with a naive `router.replace` implementation that drops search/hash state

## Static Rendering and i18n

The app is intended to stay statically generated.

- preserve `generateStaticParams()` behavior for localized routes
- avoid introducing request-time behavior in root layout just to read locale or theme state

## Validation Checklist

1. Keep locale-prefixed routing intact.
2. Keep `src/app/[locale]/layout.tsx` as the canonical locale boundary.
3. Add message keys across all locales together.
4. Preserve query and hash behavior in locale switching.
5. Use existing `next-intl` helpers from `src/i18n/navigation.ts` where relevant.
6. Run translation-shape validation if catalogs changed.

## Common Mistakes

- Adding strings to one locale only.
- Creating route trees that bypass locale prefixing.
- Removing `generateStaticParams()` from localized layout/page flows.
- Breaking locale-switch hash/query preservation.
- Returning the wrong message module shape from `src/i18n/request.ts`.
