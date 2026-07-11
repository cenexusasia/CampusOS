# CampusOS — Accessibility

## Compliance Target
WCAG 2.1 Level AA

## Keyboard Navigation
- All interactive elements reachable via Tab
- ⌘K command palette for power users
- Focus indicators on all elements
- No keyboard traps
- Escape key closes modals, drawers, and dropdowns

## Screen Reader Support
- Semantic HTML throughout
- ARIA labels on all icon-only controls
- Live regions for dynamic content (errors, loading states)
- Proper heading hierarchy (h1 → h2 → h3)
- `aria-current="page"` on active navigation links
- `aria-expanded` on expandable controls (dropdowns, menus)
- `role="alert"` on error messages
- `aria-describedby` linking inputs to their error messages
- `aria-sort` on sortable table headers
- `role="tablist"` / `role="tab"` / `aria-selected` on mobile tab navigation

## Color & Contrast
- Minimum 4.5:1 contrast ratio for text
- Information not conveyed by color alone
- Status badges include text labels
- Support for dark mode via CSS variables

## Touch & Motion
- 44px minimum touch targets
- Reduced motion media query support
- No auto-playing content

## Testing
- Manual testing with keyboard-only navigation
- Chrome Lighthouse accessibility audit
- Screen reader testing (VoiceOver/NVDA)

## ARIA Attributes Used Per Component

### Sidebar (`components/sidebar.tsx`)
- `aria-label="Main navigation"` — on all three sidebar variants (desktop, tablet, mobile drawer)
- `aria-current="page"` — on active navigation links
- `role="tablist"` and `aria-label="Main navigation"` — on mobile bottom tab bar
- `role="tab"` and `aria-selected` — on bottom tab bar links
- `aria-label="Close sidebar"` — on mobile drawer close button
- `aria-label="More navigation options"` — on "More" button
- `aria-label="Expand sidebar"` / `aria-label="Collapse sidebar"` — on collapse toggle

### Header (`components/header.tsx`)
- `aria-label="Toggle menu"` — on hamburger menu button
- `aria-label="Open search"` — on search trigger button
- `aria-label="Search"` — on search input field
- `aria-label="Close search"` — on search close button
- `aria-label="Notifications"` and `aria-expanded` — on notifications button
- `aria-label="User menu"` and `aria-expanded` — on user dropdown button

### Login Page (`app/(auth)/login/page.tsx`)
- `aria-label="Sign in form"` — on the form element
- `role="alert"` — on error alert banner
- `aria-describedby="login-error"` — on email and password inputs (conditional)
- `aria-label="Show password"` / `aria-label="Hide password"` — on password visibility toggle

### Data Table (`components/data-table.tsx`)
- `role="grid"` and `aria-label="Data table"` — on the table element
- `aria-sort="ascending"` / `aria-sort="descending"` / `aria-sort="none"` — on sortable headers
- `aria-label="Search table"` — on search input

### Dashboard (`app/(portal)/dashboard/dashboard-client.tsx`)
- `aria-label` on stat cards containing value, trend, and description
- `aria-label="Quick action: {label}"` on quick action links
- `aria-label="AI Assistant"` on AI chat section
- `role="alert"` on error banners
