# User Authentication Specification

## Problem Statement

Users currently share a single API key per workspace, so we cannot tell who did what or revoke one person's access. We need per-user login with short-lived sessions before the audit log ships.

## Goals

- [x] Every API call is attributable to a single user
- [ ] A revoked user loses access in under 15 minutes

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature     | Reason         |
| ----------- | -------------- |
| Social login (Google/GitHub) | Separate feature after MVP |
| 2FA | Planned for Q4 |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default  | Rationale | Confirmed? |
| --------------------- | --------------- | --------- | ---------- |
| Password policy | Min 12 chars, no composition rules | NIST 800-63B | y |
| Lockout | 5 failed attempts lock for 15 min | Balances brute force vs. support load | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Login with email and password ⭐ MVP

**User Story**: As a workspace member, I want to log in with my email and password so that my actions are attributed to me.

**Why P1**: Nothing else in auth works without it.

**Acceptance Criteria** (each line is one EARS pattern):

1. WHEN a user submits valid credentials THEN the system SHALL return 200 with an access token valid for 15 minutes  <!-- event-driven -->
2. IF the credentials are invalid THEN the system SHALL return 401 with problem type `invalid-credentials`  <!-- unwanted-behavior -->
3. WHILE an account is locked the system SHALL reject logins with 423  <!-- state-driven -->

**Independent Test**: Can demo by logging in with curl and calling /me.

---

### P1: Refresh token rotation ⭐ MVP

**User Story**: As a signed-in user, I want my session to renew silently so that I am not logged out every 15 minutes.

**Why P1**: 15-minute tokens are unusable without refresh.

**Acceptance Criteria**:

1. WHEN a valid refresh token is presented THEN the system SHALL issue a new token pair and revoke the old refresh token
2. IF a revoked refresh token is reused THEN the system SHALL revoke the whole token family and return 401

**Independent Test**: Refresh twice with the same token and see the second call fail.

---

### P2: Logout everywhere

**User Story**: As a user, I want to log out of all devices so that a lost laptop cannot act as me.

**Why P2**: Important, not blocking the audit log.

**Acceptance Criteria**:

1. WHEN the user calls POST /sessions/revoke-all THEN the system SHALL revoke every refresh token of that user

---

## Edge Cases

- IF the email differs only by case THEN the system SHALL treat it as the same account
- WHEN the password is exactly 12 characters THEN the system SHALL accept it

---

## Requirement Traceability

| Requirement ID | Story       | Phase  | Status  |
| -------------- | ----------- | ------ | ------- |
| AUTH-01 | P1: Login | Tasks | Verified |
| AUTH-02 | P1: Login | Tasks | Verified |
| AUTH-03 | P1: Login | Tasks | Implementing |
| AUTH-04 | P1: Refresh rotation | Tasks | Implementing |
| AUTH-05 | P1: Refresh rotation | Tasks | In Tasks |
| AUTH-06 | P2: Logout everywhere | - | Pending |

**Coverage:** 6 total, 5 mapped to tasks, 1 unmapped ⚠️

---

## Success Criteria

- [ ] 100% of API calls carry a user id in the audit trail
- [ ] Zero shared API keys in production
