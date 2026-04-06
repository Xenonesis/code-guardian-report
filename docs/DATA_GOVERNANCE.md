# Data Governance and Retention Policy

## Scope

This document defines collection-level data governance, retention, and deletion guidance for Code Guardian Enterprise.

## Classification Model

1. Confidential: user profile attributes, auth identifiers, push subscription keys.
2. Internal: operational telemetry, diagnostic logs, service metrics.
3. Public-by-design: shared GitHub repository metadata and public analysis snapshots.

## Collection Policy Matrix

| Collection               | Classification        | Access Model                           | Retention Guidance                         | Notes                               |
| ------------------------ | --------------------- | -------------------------------------- | ------------------------------------------ | ----------------------------------- |
| users                    | Confidential          | Owner-only                             | Until account deletion request             | Contains account profile metadata   |
| analysisResults          | Internal/Confidential | Authenticated + ownership-bound create | 180 days default, extendable by org policy | User generated analysis history     |
| userStats                | Internal              | Owner-only                             | 365 days rolling                           | Aggregated usage statistics         |
| userSettings             | Confidential          | Owner-only                             | Until account deletion request             | Preference and personalization data |
| analysisHistory (legacy) | Internal              | Owner-only                             | 180 days then archive/purge                | Backward compatibility path         |
| pushSubscriptions        | Confidential          | Owner-only                             | 90 days inactivity purge                   | Endpoint and key material           |
| analytics                | Internal              | Owner-only read + constrained create   | 90 days default                            | Telemetry and behavior analytics    |
| publicResources          | Public/Internal       | Authenticated read                     | As required by content lifecycle           | Write through admin path only       |
| github_repositories      | Public-by-design      | Public read                            | 365 days, refreshable                      | Never store secrets/PII             |
| github_analyses          | Public-by-design      | Public read                            | 365 days, refreshable                      | Exclude user-identifying fields     |

## Deletion Workflow

1. User deletion request intake and identity verification.
2. Execute delete job for owner-bound collections: users, userSettings, pushSubscriptions, analysisResults, userStats.
3. Remove or anonymize analytics references where legally required.
4. Emit deletion audit event with timestamp, operator, and scope.
5. Confirm deletion completion to requester.

## Legal Hold and Exception Handling

1. Security incident or legal hold can suspend deletion workflows for scoped records.
2. Holds must include an owner, justification, and expiry review date.
3. Public-by-design datasets are excluded unless they contain user-identifying leakage.

## Review Cadence

1. Quarterly review of retention periods and policy compliance.
2. Immediate review after architecture or storage model changes.
