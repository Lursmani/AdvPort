---
description: "Check or implement translation changes while preserving AdvPort locale catalog shape"
argument-hint: "Describe the namespace or locale change"
agent: "agent"
---

Use the AdvPort i18n guidance to check or implement translation changes.

Requirements:

- keep `en`, `nl`, and `ka` structurally synchronized
- preserve locale-routing guarantees
- preserve language-switch query/hash behavior
- identify any missing keys, extra keys, or type-shape drift
