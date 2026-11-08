# Security Specification for Firestore

## 1. Data Invariants
- Users can only access their own profile (for `CLIENT` role) or their assigned data (for `LAWYER` role).
- `ADMIN` role has global read access.
- `Case` data access must be validated against `clientId` or `lawyerId`.
- `Task` data access must be validated against `assigneeId` or `creatorId`.
- `AuditLog` can only be read by `ADMIN`.

## 2. The "Dirty Dozen" Payloads (Examples)
1. `POST /cases`: { "clientId": "other-client-id" } -> Should fail if user is CLIENT.
2. `PATCH /users/{myId}`: { "role": "ADMIN" } -> Should fail (RBAC escalation).
3. `POST /cases`: { "id": "poisoned-id-1.5kb-long-string..." } -> Should fail (ID validation).
4. `PATCH /invoices/{id}`: { "status": "PAID" } -> Should fail if not ACCOUNTANT/ADMIN.
5. `GET /auditLogs`: -> Should fail if not ADMIN.
6. `POST /tasks`: { "caseId": "non-existent-case" } -> Should fail (Integrity check).
7. `PATCH /tasks/{id}`: { "id": "cannot-change-id" } -> Should fail (Immutable field).
8. `POST /cases`: { "createdAt": "2020-01-01T00:00:00Z" } -> Should fail (Temporal integrity).
9. `PATCH /users/{id}`: { "isVerified": true } -> Should fail (System field).
10. `POST /invoices`: { "total": "string-instead-of-number" } -> Should fail (Type safety).
11. `PATCH /cases/{id}`: { "status": "ARCHIVED", "archivedBy": "me" } -> Should fail (Shadow fields).
12. `POST /tasks`: { "title": "" } -> Should fail (Size validation).

## 3. Test Runner Placeholder
We will implement `firestore.rules.test.ts` to execute these scenarios.
