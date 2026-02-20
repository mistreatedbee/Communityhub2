# Tenant Member Design System

Consistent layout and typography for tenant member and public community pages. Member pages must feel like a **modern community portal**, not an admin dashboard.

## Tokens

- **Page container:** `max-w-6xl` (or `max-w-4xl` for narrow pages), `px-4 sm:px-6 lg:px-8`, `py-8 sm:py-10`
- **Page title:** `text-3xl` / `sm:text-4xl`, `font-bold`, `tracking-tight`, `text-gray-900`
- **Section title:** `text-xl` / `sm:text-2xl`, `font-semibold`, `tracking-tight`, `text-gray-900`
- **Body:** `text-gray-600` or `text-gray-700`, comfortable line-height
- **Caption / metadata:** `text-sm` or `text-xs`, `text-gray-500`
- **Accent:** `var(--color-primary)` for links, buttons, and accents
- **Spacing:** Section bottom margin `mb-12 sm:mb-14`; content gaps `space-y-4` to `space-y-6`

## Components

- **MemberPageContainer:** Wraps all member/public page content.
- **PageHeader:** Page title, optional subtitle, optional back link.
- **Section / SectionTitle:** Content section with title and optional "View all" link.
- **ContentCard:** Content block (subtle bg, padding, optional left accent)—not a heavy bordered card.

## Rules

- Do **not** use tables for content listing.
- Do **not** use a grid of plain bordered cards without hierarchy.
- Use clear section hierarchy (hero → sections → content blocks).
- Use consistent hover/transition (e.g. `transition-colors duration-200`).
