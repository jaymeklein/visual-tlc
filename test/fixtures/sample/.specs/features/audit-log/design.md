# Audit Log Design

**Spec**: `.specs/features/audit-log/spec.md`
**Status**: Draft

---

## Architecture Overview

Domain events are written to an append-only `audit_entries` table by a single AuditWriter.

---

## Components

### AuditWriter

- **Purpose**: Persists audit entries
- **Location**: `src/audit/audit.writer.ts`

### AuditQuery

- **Purpose**: Paginated read API for admins
- **Location**: `src/audit/audit.query.ts`

---

## Risks & Concerns

> None found - is a valid entry.
