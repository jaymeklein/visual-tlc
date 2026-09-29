# Dark Mode Specification

## Problem Statement

Users working at night asked for a dark theme.

## Assumptions & Open Questions

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Default theme | Follow the OS setting |  | n |
| [ambiguity]           | [what we'll do] | [why]     | [y/n]      |

**Open questions:** should charts also switch palette?

---

## User Stories

### P1: Toggle dark mode ⭐ MVP

**User Story**: As a user, I want a dark theme so that the app is easier on my eyes.

**Acceptance Criteria**:

1. WHEN the user toggles the theme THEN the system SHALL apply dark colors within 100 ms
2. The theme should look nice
3. Colors SHALL meet WCAG AA contrast

### P2: Remember preference

**User Story**: As a user, I want my choice remembered.
