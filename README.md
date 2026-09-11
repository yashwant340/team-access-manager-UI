# Team Access Manager

Team Access Manager is a full-stack access-governance application for managing people, teams, product features, and feature-level permissions. It supports platform-wide administration, team-scoped administration, employee self-service access requests, approval workflows, password recovery, email notifications, and audit history.

This repository contains the React frontend. The Spring Boot API is in the sibling `team-access-manager-service` repository.

## Core features

### Authentication and account lifecycle

- Username/password authentication with a one-hour JWT.
- Protected frontend routes and authenticated API requests.
- Self-service account request form for prospective users.
- Platform-admin review of login requests, team assignment, account creation, and temporary-password email.
- Three-step password recovery: request OTP, verify OTP, and reset password with a short-lived one-time reset token.
- OTP expiry, resend cooldown, maximum invalid-attempt limit, and single-use reset tokens.
- Soft deactivation of users and teams so historical information is retained.

### Roles and administrative scope

| Role | UI route | Scope |
| --- | --- | --- |
| `PLATFORM_ADMIN` | `/platform-admin` | All teams, users, permissions, access requests, and login requests |
| `TEAM_ADMIN` | `/team-admin` | Its own team, members, permissions, and member access requests |
| `USER` | `/user-dashboard` | Personal profile, effective access, requests, and activity |

### Team and user access management

- Create teams with an initial feature-permission matrix.
- View active and inactive teams and their members.
- Grant or revoke a feature for an entire team.
- Add and edit users, assign teams, and deactivate accounts.
- View active and inactive users.
- Choose one of two user access modes:
  - `INHERIT_TEAM_ACCESS`: effective access comes from the user's team.
  - `OVERRIDE_TEAM_ACCESS`: effective access comes from per-user feature records.
- Switch from inherited permissions to a custom snapshot and edit individual features.
- Switch back to inherited permissions and deactivate old override records.
- Deactivating a team changes inheriting members to custom, deny-all access so an inactive team cannot continue granting access.

### Requests and approvals

- A user can request either `GRANT` or `REVOKE` for a feature.
- Users see pending state beside their effective feature access and may cancel a request.
- Platform admins can review every pending request.
- Team admins can review only requests from their own team.
- The review dialog shows the requester, access mode, current feature state, and other permissions.
- An approved request updates effective access; a rejected request closes without changing permissions.
- Approving a request for an inheriting user copies the team's complete permission set into user overrides and changes only the requested feature. This prevents one person's exception from changing the whole team.

### Auditability and user experience

- Audit records capture team creation/deactivation, user creation/update/deactivation, access-mode changes, team and user permission changes, requests, cancellations, and decisions.
- Audit views identify the actor, action, affected feature where applicable, and timestamp.
- Responsive dashboards include search, filters, tabs, pagination, loading feedback, dialogs, and toast notifications.

## Architecture

```text
Browser
  React 18 + TypeScript + Vite
  React Router + AuthProvider + Easy Peasy
  Material UI / Ant Design
        |
        | JSON over HTTP, Bearer JWT
        v
Spring Boot 3 REST API
  Controllers -> Services -> Mappers -> Repositories
  Spring Security + JWT + BCrypt
        |
        +---- PostgreSQL (JPA entities and audit data)
        |
        +---- Gmail SMTP (approval and OTP emails)
```

The frontend keeps authentication state in `AuthProvider`, persists the token in `localStorage`, and uses an Axios request interceptor to attach `Authorization: Bearer <token>`. `PrivateRoute` validates the signed-in user's platform role before rendering a dashboard. Easy Peasy currently provides shared feature-list state; most screen data is fetched locally by its owning component.

The backend follows a layered structure:

- Controllers define REST resources under `/api/auth` and `/api/v1/team-access-manager`.
- Services contain authentication, approval, access-calculation, audit, email, and lifecycle rules.
- Mappers translate entities and request wrappers to DTOs.
- Spring Data repositories implement persistence queries.
- JPA entities model users, teams, features, team/user controls, requests, and audit entries.

## Data model

| Entity | Purpose |
| --- | --- |
| `User` | Identity, credentials, platform role, business role, team, active state, and access mode |
| `Team` | Organizational group containing users and team permissions |
| `Feature` | A protected product capability |
| `TeamAccessControl` | One team/feature grant or denial; the pair is unique |
| `UserAccessControl` | One user/feature override; the pair is unique and can be inactive |
| `AccessRequest` | A user's pending/completed grant or revoke request |
| `LoginRequest` | A prospective user's account request awaiting platform approval |
| `AuditTrail` | Actor, action type, description, target reference, and timestamp |

Effective access can be summarized as:

```text
if user.accessMode == OVERRIDE_TEAM_ACCESS:
    use active UserAccessControl records
else:
    use the user's TeamAccessControl records
```

## Main API groups

| Base path | Examples |
| --- | --- |
| `/api/auth` | Login, current user, login request, send/resend/verify OTP, reset password |
| `/api/v1/team-access-manager/admin` | Pending login requests and approval |
| `/api/v1/team-access-manager/team` | Teams, team permissions, audits, pending requests, decisions |
| `/api/v1/team-access-manager/user` | Users, access modes, permissions, dashboard data, audits, access requests |
| `/api/v1/team-access-manager/feature` | List and create features |

## Technology stack

### Frontend

- React 18 and TypeScript
- Vite 7
- React Router 7
- Axios
- Easy Peasy
- Material UI, MUI Data Grid, and Ant Design
- React Toastify

### Backend

- Java 24 and Spring Boot 3.5
- Spring Web, Security, Data JPA, and Mail
- JJWT 0.11.5 and BCrypt
- PostgreSQL; H2 is also present as a runtime dependency
- Lombok and Maven
- JUnit/Spring Boot Test

## Local setup

### Prerequisites

- Node.js 20+ and npm
- Java 24
- PostgreSQL
- A Gmail account/app password if email flows will be exercised

### 1. Configure and run the API

From `team-access-manager-service`, configure environment-specific values in `src/main/resources/application.properties` (database URL, database credentials, and SMTP credentials), then run:

```bash
./mvnw spring-boot:run
```

The checked-in service configuration uses port `8081`.

> Security note: do not commit real database, SMTP, or JWT secrets. Prefer environment variables or a non-versioned local profile and rotate any credential that has previously been committed.

### 2. Configure the Vite proxy

The frontend calls relative `/api` URLs. Ensure `vite.config.ts` proxies `/api` to the service port (`http://localhost:8081`) or run both applications behind a gateway that routes `/api` to the backend.

### 3. Install and run the UI

```bash
npm install
npm run dev
```

Vite prints the local browser URL, normally `http://localhost:5173`.

### 4. Production build and checks

```bash
npm run lint
npm run build
```

Backend checks:

```bash
./mvnw test
```

## Project structure

```text
team-access-manager-UI/
├── src/api/             Axios client and auth interceptor
├── src/components/      Access managers, dialogs, tables, layout helpers
├── src/pages/           Login, recovery, admin and user dashboards
├── src/providers/       Authentication context
├── src/store/           Easy Peasy store and feature model
├── src/types/           Shared frontend DTO shapes
└── src/utils/           Role routing and refresh helpers

team-access-manager-service/
└── src/main/java/com/example/accessManager/
    ├── config/          Spring Security configuration
    ├── controller/      REST endpoints
    ├── dto/             API response/request contracts
    ├── entity/          JPA domain model
    ├── mapper/          Entity/DTO conversions
    ├── repository/      Spring Data repositories
    ├── service/         Interfaces and infrastructure services
    ├── service/impl/    Business rules
    ├── utils/           JWT and current-user helpers
    └── wrapper/         Command/request payload models
```
