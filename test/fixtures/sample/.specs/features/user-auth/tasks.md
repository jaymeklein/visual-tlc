# User Authentication Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path.

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/user-auth/design.md`
**Status**: In Progress

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `CONTRIBUTING.md`.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Service | unit | All branches; 1:1 to spec ACs | `src/**/*.spec.ts` | `npm run test:unit` |
| Controller | e2e | happy + edge + error | `test/e2e/*.e2e.ts` | `npm run test:e2e` |
| Migration | none | build gate only | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e/integration tests | `npm run test:unit && npm run test:e2e` |
| Build | After phase completion | `npm run build && npm run lint && npm test` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

Tasks that must be done first, in order.

```
T1 → T2 → T3
```

### Phase 2: Core Implementation

Builds on the foundation.

```
T3 → T4 → T5
```

### Phase 3: Integration

Bringing it all together.

```
T5 → T6 → T7
```

---

## Task Breakdown

### T1: Switch password hashing to argon2id

**What**: Replace sha256 hashing with argon2id in the crypto helper
**Where**: `src/shared/crypto.ts`
**Depends on**: None
**Reuses**: `src/shared/crypto.ts`
**Requirement**: AUTH-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] argon2id used for hash and verify
- [x] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

---

### T2: Create refresh_tokens migration

**What**: Table with token hash, family id, revoked_at
**Where**: `migrations/0007_refresh_tokens.sql`
**Depends on**: T1
**Reuses**: existing migration pattern

**Done when**:

- [x] Migration applies and rolls back

**Tests**: none
**Gate**: build

---

### T3: Implement AuthService.login

**What**: Credential check + token pair issuance
**Where**: `src/auth/auth.service.ts`
**Depends on**: T2
**Requirement**: AUTH-01, AUTH-02, AUTH-03

**Done when**:

- [x] Returns 15-minute access token
- [x] Invalid credentials raise invalid-credentials
- [x] Test count: 9 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

---

### T4: Implement RefreshService.rotate

**What**: Rotate refresh tokens and revoke the family on reuse
**Where**: `src/auth/refresh.service.ts`
**Depends on**: T3
**Requirement**: AUTH-04

**Done when**:

- [x] New pair issued, old token revoked
- [ ] Reuse revokes the whole family
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

---

### T5: Lockout after failed attempts

**What**: Lock account for 15 minutes after 5 failures
**Where**: `src/auth/auth.service.ts` (modify)
**Depends on**: T4
**Requirement**: AUTH-03

**Done when**:

- [ ] 6th attempt returns 423
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

---

### T6: AuthController routes

**What**: POST /login and POST /refresh
**Where**: `src/auth/auth.controller.ts`
**Depends on**: T5
**Requirement**: AUTH-01, AUTH-05

**Done when**:

- [ ] Routes return problem+json errors (AD-001)
- [ ] Gate check passes: `npm run test:unit && npm run test:e2e`

**Tests**: e2e
**Gate**: full

---

### T7: Wire auth module

**What**: Register controller and guards in the app module
**Where**: `src/app.module.ts`
**Depends on**: T6

**Done when**:

- [ ] App boots with auth routes
- [ ] Build gate passes

**Tests**: e2e
**Gate**: build

**Commit**: `feat(auth): wire auth module`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ------→ T2 ------→ T3
Phase 2:  T4 ------→ T5
Phase 3:  T6 ------→ T7
```
