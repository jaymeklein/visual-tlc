# User Authentication Context

**Gathered:** 2026-09-02
**Spec:** `.specs/features/user-auth/spec.md`
**Status:** Ready for design

---

## Feature Boundary

Email/password login, refresh rotation and logout-everywhere. No social login, no 2FA.

---

## Implementation Decisions

### Error messages

- Same message for unknown email and wrong password

### Session length

- Access token 15 min, refresh token 30 days sliding

### Agent's Discretion

Token storage format on the client.

### Declined / Undiscussed Gray Areas → Assumptions

Lockout duration - logged as an assumption in spec.md.

---

## Specific References

No specific requirements - open to standard approaches

---

## Deferred Ideas

- Magic-link login (separate feature)
