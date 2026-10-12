# Community Disaster Watch UI/UX Audit and Verification Plan

**Audit basis:** source and CSS inspection of the current React/Vite interface, including the latest UI changes. This is a static audit, not a claim of visual or end-to-end verification.

## Evidence available

- The in-app browser connection reported that no browser was available. No screenshots, browser measurements, or interactive viewport observations could be captured in this environment.
- The current project has no browser automation dependency. The frontend production build succeeds and the existing Node test suite passes, but those checks do not establish that any viewport renders without overflow.
- PostgreSQL was unavailable at the configured endpoint in the prior verification attempt, so authenticated citizen and authority screens could not be exercised with live records.
- Responsive breakpoints and component behavior below are inferred from `src/styles.css` and `src/main.jsx`. They must be confirmed in a browser before release.

## Responsive test attempt — 2026-10-09

**Result: blocked before viewport inspection.** The in-app browser runtime returned no available browsers. No listeners were found on the app/database ports 3001, 5173, 15432, or 5432, so the real application and authenticated pages were not available. This environment also did not expose Docker, Chrome, Edge, or Chromium executables. No viewport was marked passed, no screenshot was captured, and no layout regression can be confirmed or ruled out from this attempt.

| Requested viewport | Result |
|---|---|
| 320×640 | Not run — no browser/app session |
| 375×812 | Not run — no browser/app session |
| 390×844 | Not run — no browser/app session |
| 768×1024 | Not run — no browser/app session |
| 1024×768 | Not run — no browser/app session |
| 1366×768 | Not run — no browser/app session |
| 1440×900 | Not run — no browser/app session |
| 1920×1080 | Not run — no browser/app session |
| 2560×1440 | Not run — no browser/app session |

Citizen, authority, responder, and administrator pages; reporting forms; incident queue/cards; charts; maps; and dialogs were not browser-inspected. Some of these surfaces are also not implemented yet (see the page inventory and P0 findings above). No code fix is claimed from this blocked run. To complete the requested pass, the application and database must be available and a browser session must be exposed to this environment.

## Current product and page inventory

The frontend is a single React application in `src/main.jsx` with shared navigation and view state. It has no router or reusable component library. The same visual shell contains the following views:

| Page / state | Current content and data | Audit findings |
|---|---|---|
| Sign in / registration | Email/password; resident registration; shared `AuthForm` | Functional form and loading/error feedback. No account recovery flow. No browser evidence for small screens or focus order. |
| Citizen report | Hazard, severity, area, description, locality, district, municipality, optional coordinates/time, and photo; calls the reports API | Core report submission is present. Fields are a long single form; location and incident-time guidance and field-level errors need review. The form does not provide an interactive map. |
| Community incidents | Latest report records, area/search/status/severity filters, image, status, date, and a brief analysis state | Responsive card presentation is preferable to a wide table. It shows community records rather than a distinct “My reports” dashboard. Citizens do not get the authority incident timeline/detail workflow. |
| Notifications | In-app inbox and area subscriptions | Uses real API data, but the subscription checkboxes and narrow-screen layout need device validation. |
| Authority (`ADMIN`) | Jurisdiction counts and distributions, report queue, verification/rejection/resolution actions, assignment controls, analysis context and activity | Backend APIs enforce the role and area checks. The interface lacks queue pagination, server-side filters, a dedicated incident detail screen, and assignment acknowledgement controls. Counts refresh through the existing polling cycle; they are not a streaming feed. |
| Responder | No responder-specific page or navigation | Assignment acknowledge/responding APIs exist, but the UI does not expose an operational responder dashboard. This is a critical workflow gap. |
| Administrator management | Organization/team creation and membership APIs exist | No corresponding management screen for users, authorities, teams, or audit/system health. Do not present those APIs as a complete admin panel. |

## Existing design system

The stylesheet contains two generations of CSS: an original green community-reporting theme followed by a later navy operations override. The latter defines some tokens and component patterns but does not yet form a single source of truth. Earlier selectors and duplicate breakpoints remain in the file, so future changes can be unintentionally overridden by cascade order.

Current tokens in the later override:

| Token | Current value | Use |
|---|---|---|
| `--navy-950` | `#10283f` | Main headings and deepest text/navy |
| `--navy-800` | `#193d5b` | Primary buttons and navigation |
| `--blue-700` | `#245c85` | Secondary blue and chart bars |
| `--canvas` | `#f3f6f8` | Page background |
| `--surface` | `#fff` | Panels and cards |
| `--ink` / `--muted` | `#1d2d3c` / `#5c6d7b` | Main and supporting text |
| `--line` | `#d7e0e7` | Borders and separators |
| semantic green/amber/red | `#236447` / `#8a550e` / `#a33434` | Status and severity communication alongside text labels |

Typography uses system sans-serif fallbacks with fluid page headings. Existing reusable patterns are CSS classes rather than extracted components: `panel`, `primary`, `status`, `severity`, `metric-card`, `notification`, and `assessment`. The navigation, report-card layout, and modal are embedded in the main component. There is no icon or chart library.

## Proposed shared tokens and components

Treat the values above as the first token proposal, then consolidate them at the top of the stylesheet before adding more visual treatment. Keep semantic foreground/background pairs and avoid using color as the only status cue.

| Token group | Proposed contract |
|---|---|
| Color | Navy for primary actions and shell; neutral canvas/surface/text/border; semantic status/severity pairs with readable text labels. Use one token per role, not per component. |
| Type | System sans family; body 14–16px, supporting 12–14px, page title 30–43px fluid, consistent 1.45–1.65 line height. Never shrink operational labels to fit. |
| Spacing | 4px base scale: 4, 8, 12, 16, 24, 32, 40. Use consistent page gutters and panel padding. |
| Shape/elevation | 6–9px control/card corners; one subtle card shadow and one modal shadow; use borders for grouping before adding elevation. |
| Interaction | 44px minimum target where practical; clear focus ring; hover is supplemental; disabled/loading states remain distinguishable. |
| Layout | Content max-width around 1440px, expanded dashboard max-width around 1680px, min-width 320px, fluid gutters, and a 12-column mental grid without fixed page widths. |

Reusable components to extract incrementally after workflow testing: `AppShell`, `WorkspaceNavigation`, `PageHeader`, `StatusBadge`, `SeverityBadge`, `MetricCard`, `DistributionList`, `IncidentCard`, `IncidentFilters`, `ActivityTimeline`, `InlineNotice`, `FormField`, `EmptyState`, `LoadingState`, `ErrorNotice`, and an accessible `ConfirmDialog`. Keep domain actions in the API-connected page components and keep authorization enforced by the backend.

## Responsive layout strategy

1. **320–480px:** one content column; collapsed navigation; cards instead of tables; two-column filters only when labels remain readable; stack action buttons and modal footer; preserve safe-area padding; do not hide status, severity, time, ID, or primary action.
2. **481–767px:** use the same compact navigation and card presentation, with two-column form/filter groups only where they fit naturally.
3. **768–1023px:** use adaptive two-column layouts for report form/support content and metric grids; incident queue cards remain readable without compressing important controls.
4. **1024–1439px:** retain the desktop navigation and use a bounded main column; keep the report form and support content balanced, and filters aligned in one row only when they fit.
5. **1440–1919px:** use available space for balanced metrics and queue/detail layouts while maintaining a readable content max-width.
6. **1920px and above:** expand the dashboard container and metric spacing; do not stretch paragraphs, densely pack incident queues, or expose private information differently.

Use CSS grid `minmax(0, …)` for shrinkable columns, `min-width: 0` on nested cards, wrapping for long IDs and locations, and local scrolling only for genuinely wide data. Keep the map and charts out of this strategy until those features exist; do not imply that they have responsive support today.

## Defects and risk ranking

### P0 — workflow and trust

- **Responder actions have no user-facing page.** A responder cannot use the current interface to see assignments, acknowledge them, or record Responding progress. Implement the role-specific queue and verify server permissions before visual polish.
- **Citizen tracking is not distinct from community browsing.** Add a “My reports” view with the citizen’s own IDs, severity, status, submitted time, permitted updates, and chronological activity. Preserve the existing community list separately if desired.
- **Authority list is a capped, client-filtered queue.** Search and status/area/severity filters only work over the latest 100 records returned to the browser. Add backend query parameters, pagination metadata, stable sort options, and consistent jurisdiction checks before presenting this as an operational queue.
- **Critical actions need interaction review.** Rejection/resolution now use an in-app confirmation dialog, but keyboard focus trapping/restoration, Escape behavior, and screen-reader announcements have not been verified.

### P1 — responsive and accessibility correctness

- The new mobile menu, dialogs, queue cards, form controls, and notification subscription layout have no measured viewport results. CSS breakpoints alone do not prove absence of overflow or clipping.
- The CSS has duplicate legacy rules and appended overrides. Consolidate design tokens and breakpoints after critical workflow behavior is stabilized to reduce cascade regressions.
- Long incident identifiers, descriptions, organization names, and assessment tables may stress narrow layouts; verify wrapping and any local horizontal scroll.
- The report form currently relies mainly on native `required` validation and a page-level error message for server failures. Validate where errors are announced and whether values remain available after recoverable failures.
- The modal uses `role="dialog"` and `aria-modal`, but no focus trap, focus restoration, or Escape-close behavior has been verified or implemented as a shared pattern.
- Automated assessment weather tables are wide; they use a local scroll container. Verify that this remains understandable and keyboard-scrollable on touch and keyboard devices.
- Color/contrast and large-text behavior are unmeasured. Status labels are present, but perform contrast and 200% text zoom checks before any WCAG conformance statement.

### P2 — consistency and polish

- The current shell retains a large shared welcome block across all views. Use page-specific titles and contextual actions without creating disconnected role experiences.
- Build coherent empty, stale-data, loading, and error presentations for each page. Existing generic success/error feedback is useful but not yet consistently contextual.
- Distribution bars have visible labels and numbers; verify the values remain understandable without color and add a concise text summary if screen-reader testing identifies ambiguity.

## Page-by-page verification checklist

Run each viewport in both portrait and landscape where meaningful. At minimum use 320×640, 375×812, 390×844, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080, and 2560×1440 when available.

| Page | Responsive checks | Functional checks | Accessibility checks | Current status |
|---|---|---|---|---|
| Sign in / registration | ☐ all viewports; no clipped form/buttons; landscape | ☐ register, login, invalid credentials, loading, server unavailable | ☐ label/input association, autocomplete, keyboard order, error announcement, visible focus | Source reviewed; no live browser test |
| Citizen report | ☐ all viewports; stacked fields; upload preview; button visible | ☐ valid report, required validation, invalid image, duplicate-click protection, recovery after API error | ☐ required fields, grouped coordinates, inline/announced errors, image alt text, keyboard file upload | Source reviewed; no database-backed test |
| Citizen “My reports” (planned) | ☐ all viewports; compact incident cards | ☐ own reports only, detail/timeline, refresh persistence, no cross-user access | ☐ status text, timeline semantics, empty/error/loading states | Not implemented |
| Community incidents | ☐ all viewports; card layout; filters wrap; image sizing | ☐ search/area/status/severity, stable sort, pagination, photo authorization | ☐ filter labels, result count, status/severity labels, keyboard controls | Current filters only cover fetched records; no browser test |
| Notifications | ☐ all viewports; subscription panel stacks; no overflow | ☐ list, mark read, save subscriptions, refresh/poll behavior | ☐ unread state text, checkbox labels, live update announcement | Source reviewed; no browser test |
| Authority overview and queue | ☐ all viewports; metrics/distributions resize; filters usable | ☐ authorized jurisdiction data, server search/filter/sort/page, empty/stale/error states | ☐ chart alternatives, card headings, action names, focus/dialog behavior | Overview uses actual API counts; queue pagination missing |
| Incident action dialog/detail | ☐ all viewports; modal fits visible area and scrolls internally | ☐ verify, reject reason, assignment, duplicate/invalid transitions, resolve summary | ☐ focus entry/trap/restore, Escape/cancel, required note, success/error announcement | Dialog exists; keyboard/modal behavior unverified |
| Responder dashboard (planned) | ☐ all viewports; assignment cards and timestamps | ☐ assigned-only data, acknowledge once, Responding only after acknowledgement, progress history | ☐ assignment vs acknowledgement vs deployment language; keyboard actions | No responder UI |
| Admin management (planned) | ☐ all viewports; responsive searchable/paginated lists and confirmation dialog | ☐ role/user/team/jurisdiction operations and audit history | ☐ destructive action confirmation, least-privilege labels, focus management | APIs are incomplete for this page; UI absent |

### Evidence recording template

For each checked page, record the exact viewport, role/account fixture, route/view, browser and OS, screenshot path, horizontal overflow result, defects, fixes, functional test result, and keyboard/screen-reader observations. Keep screenshots synthetic and redact personal data.

## Implementation order

1. **Workflow completeness:** implement and test citizen-owned report tracking, responder assignments/acknowledgement/progress UI, and server-paginated authority queues. Validate all endpoints and role/jurisdiction boundaries first.
2. **Responsive defects:** run the viewport matrix against those critical screens; fix overflow, clipping, touch targets, dialog fit, and keyboard navigation before restyling secondary content.
3. **Shared primitives:** consolidate duplicate CSS into the token contract and reusable accessible components; preserve the existing navy/neutral visual direction.
4. **Data presentation:** add only API-backed metrics/filters; do not invent map, deployment, or response-time data. Add accessible text alternatives to visual distributions.
5. **Visual refinement:** tune typography, spacing, hierarchy, and empty/loading/error states after workflow and layout checks pass.
6. **Regression pass:** rerun tests and every affected viewport/page/role checklist; record actual results and attach screenshots where browser access is available.
