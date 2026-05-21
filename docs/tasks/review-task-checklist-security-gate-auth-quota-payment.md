# Review-task checklist draft — Security-sensitive gate (auth/quota/payment)

## Scope

Final review gate for changes touching auth boundary, quota enforcement, entitlement, or payment flows.

## Must-fix checks

1. **Auth identity authority**
   - Firebase UID is canonical identity end-to-end.
   - No trust in client-provided tier/entitlement claims.

2. **Entitlement authority**
   - Entitlement/quota decisions enforced server-side.
   - Premium access checks include tier expiry at request-time.

3. **Quota exceed contract**
   - All exceed paths return `429`.
   - `retry_after` present and meaningful.
   - No mixed exceed semantics (`403`/`400`) for equivalent quota breaches.

4. **Payment trust chain**
   - Webhook signature verified before any entitlement state mutation.
   - No entitlement grant via payment returnUrl/client callback.
   - Payment mutation path is idempotent and atomic.

5. **Idempotency protection**
   - AI/payment-sensitive endpoints requiring idempotency key enforce it consistently.
   - Replay handling does not double-grant quota/entitlement.

6. **Guardrail compliance**
   - No Live Tracker-related implementation.
   - No Riot ToS-violating data/access pattern.

## Should-fix checks

- Error model consistency across auth/quota/payment APIs.
- Auditability: key security decisions/events are logged with traceable identifiers.
- Test coverage includes unhappy paths for signature failure, replay, and expiry boundary.

## Nice-to-have checks

- Contract examples document `429 + retry_after` clearly.
- Reviewer notes map each sensitive endpoint to trust boundary.

## Review verdict rule

- Any failure in Must-fix => `not-ready`.
- Proceed to merge only when Must-fix is clean.
