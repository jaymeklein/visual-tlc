# STATE

## Decisions

### AD-001
- **Decision**: All HTTP handlers return errors as RFC 7807 problem+json
- **Reason**: One error contract for web and mobile clients
- **Trade-off**: Slightly more verbose payloads
- **Scope**: all API routes
- **Date**: 2026-08-02
- **Status**: active

### AD-002
- **Decision**: Sessions stored in Redis with 24h TTL
- **Reason**: Horizontal scaling of the API
- **Trade-off**: Extra infrastructure dependency
- **Scope**: auth, billing
- **Date**: 2026-08-10
- **Status**: superseded by AD-003

### AD-003
- **Decision**: Stateless JWT access tokens (15 min) + rotating refresh tokens in Postgres
- **Reason**: Removes Redis from the critical path; refresh rotation gives revocation
- **Trade-off**: Revocation is delayed up to 15 minutes
- **Scope**: auth and every feature that reads the session
- **Date**: 2026-09-01
- **Status**: active

## Handoff

- **Feature**: .specs/features/user-auth
- **Phase / Task**: Phase 2 / T4 - implement refresh token rotation
- **Completed**: T1, T2, T3
- **In-progress** (file:line): `src/auth/refresh.service.ts:88` - mid-write
- **Next step**: Finish rotation in RefreshService.rotate() and make the quick gate pass
- **Blockers**: none
- **Uncommitted files**: src/auth/refresh.service.ts
- **Branch**: feat/user-auth
