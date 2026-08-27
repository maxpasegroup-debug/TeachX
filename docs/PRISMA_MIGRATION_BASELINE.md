# Prisma migration baseline

## Source

The foundational migration is generated from `prisma/schema.prisma` at Git commit `fe26caf16dbf5afe26086e705f2aa061f0b092fa` (`Initial TeachX production launch`). That schema validates with Prisma 6.12.0 and contains 141 models and 93 enums.

Generation command used against a temporary, BOM-free copy of the historical schema:

```powershell
npx prisma migrate diff --from-empty --to-schema-datamodel <historical-schema.prisma> --script --output prisma/migrations/20260729000000_initial_teachx_baseline/migration.sql
```

The baseline sorts before all 12 existing incremental migrations. Those migrations remain byte-for-byte unchanged.

## Datamodel reconciliation

The `20260730170000_student_community` migration creates 42 foreign keys that were not represented as Prisma relation fields. They are intended integrity constraints because every source column, referenced model, delete action and application ownership path is explicit in the existing SQL. The current datamodel now represents all 42 relationships across:

- Student community requests, votes, accepted answers and accepted-answer history.
- Reports and user blocks.
- Resource shares, including their optional self-supersession relationship.
- Group events and RSVPs.
- Group challenges and participants.
- Community reputation records.

Two migration-defined indexes are also represented:

- `AssignmentSubmissionRevision.reviewedById` as a normal index.
- `StudentCommunityResourceShare.supersedesId` as a unique one-to-one relation index.

After reconciliation, the migration chain and current datamodel have matching semantic sets of 180 tables, 111 enums, 1,771 columns, 249 indexes and 398 foreign keys.

## SQL-managed check constraints

Prisma 6 does not represent PostgreSQL `CHECK` constraints in the datamodel. The following 20 constraints are intentional, remain unchanged in existing migrations, and are preserved by `prisma migrate deploy`:

| Constraint | Intended rule |
|---|---|
| `MarketplaceBuyerReview_rating_check` | Rating is between 1 and 5. |
| `MarketplaceListing_price_nonnegative_check` | Price is nonnegative. |
| `MarketplaceListing_previous_price_nonnegative_check` | Previous price is null or nonnegative. |
| `MarketplaceListing_currency_format_check` | Currency is a three-letter uppercase code. |
| `StudentCommunityVote_value_check` | Vote is `-1` or `1`. |
| `StudentCommunityBlock_not_self_check` | A user cannot block themselves. |
| `StudentCommunityResourceShare_type_check` | Snapshot type is one of the supported values. |
| `StudentGroupEvent_kind_check` | Event kind is study session, revision or quiz. |
| `StudentGroupEvent_status_check` | Event status is active, cancelled or completed. |
| `StudentGroupEvent_time_check` | Event end is after its start. |
| `StudentGroupEventRsvp_status_check` | RSVP is going or not going. |
| `StudentGroupChallenge_kind_check` | Challenge kind is study, revision or quiz. |
| `StudentGroupChallenge_status_check` | Challenge status is active, cancelled or completed. |
| `StudentGroupChallenge_target_check` | Challenge target is between 1 and 100. |
| `StudentGroupChallenge_time_check` | Challenge end is after its start. |
| `StudentGroupChallengeParticipant_progress_check` | Progress is between 0 and 100. |
| `StudentCommunityReputation_points_check` | Reputation points are between -20 and 20. |
| `StudentCommunityReputation_event_check` | Reputation event is an approved ledger event. |
| `StudentCommunityResourceShare_version_check` | Resource-share version is positive. |
| `StudentCommunityResourceShare_status_check` | Resource-share status is published, superseded or removed. |

These constraints must not be removed merely because Prisma schema diff output cannot display them.

## Production warning

The new baseline must never be deployed to an existing database until its actual `_prisma_migrations` history has been inspected and an approved migration-history procedure has marked the baseline as already applied. This document does not authorize or perform that production operation.
