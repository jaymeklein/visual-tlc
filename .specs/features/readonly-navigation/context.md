# Read-only Navigation Context

**Gathered:** 2026-09-29
**Spec:** `.specs/features/readonly-navigation/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Every click on a skill artifact in the extension opens it in preview mode; tasks appear as a read-only list in the tree and in the dashboard. No editing capability is added.

---

## Implementation Decisions

### How artifacts open

- A click opens the native Markdown preview, in the active column
- An inline "Open in Editor" icon on stage, file, requirement and phase rows takes the cursor to the item's line
- Warnings still open the editor at the problem's line

### Task list

- The Tasks and Execution stages expand the same list, grouped by Phase
- A task expands into its details as read-only items (What, Where, Depends on, Requirements, Tests/Gate, Done when)
- In the dashboard, the task row expands and collapses the details in place

### Agent's Discretion

Icons and text of the detail items; position of the editor icon in the dashboard.

### Declined / Undiscussed Gray Areas → Assumptions

Execution stage file, no editor icon on tasks, and the dashboard editor icon limited to the Files section — recorded as assumptions in the spec.

---

## Specific References

No specific requirements - open to standard approaches

---

## Deferred Ideas

- Preview scrolled to the item's line (depends on Markdown preview support)
