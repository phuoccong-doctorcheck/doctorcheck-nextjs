# DOCTORCHECK CMS — PRODUCTION OPERATIONS RUNBOOK

This document establishes the official operational standard, security controls, backup/recovery procedures, and disaster recovery runbooks for the DoctorCheck Next.js + PostgreSQL CMS.

---

## 1. Environment Configuration & Variables

### Required Variables (All Environments)
- `DATABASE_URL`: PostgreSQL connection string (`postgresql://[user]:[password]@[host]:[port]/[database]?schema=public`).
- `NODE_ENV`: Runtime classification (`development` | `test` | `production`).
- `DATA_PROVIDER`: Set to `postgres` for production cutover.

### Storage Variables (Production)
- `STORAGE_PROVIDER`: Must be set to `s3` for containerized/serverless deployments.
- `S3_BUCKET`: Target S3 bucket / Cloudflare R2 bucket name.
- `S3_REGION`: S3 bucket region (e.g., `auto` for Cloudflare R2, `ap-southeast-1` for AWS).
- `S3_ENDPOINT`: S3-compatible API endpoint (e.g., `https://<account_id>.r2.cloudflarestorage.com`).
- `S3_ACCESS_KEY_ID`: Cloudflare R2 / AWS S3 Access Key ID.
- `S3_SECRET_ACCESS_KEY`: Cloudflare R2 / AWS S3 Secret Access Key.
- `S3_PUBLIC_URL_PREFIX`: Canonical public CDN URL for media (e.g., `https://media.doctorcheck.vn`).
- `ALLOW_LOCAL_STORAGE_IN_PRODUCTION`: Set to `true` **only** if the production environment is hosted on a single virtual machine with persistent local disk storage.

---

## 2. Database Role Architecture & Least Privilege

For hardened production deployments, database access should be separated into three distinct roles:

| ROLE | PRIVILEGES | USED BY |
| :--- | :--- | :--- |
| **`doctorcheck_migrator`** | `CREATE`, `ALTER`, `DROP`, `REFERENCES`, `INDEX` on schema `public` | Deployment pipeline / Migration scripts only |
| **`doctorcheck_cms_app`** | `SELECT`, `INSERT`, `UPDATE`, `DELETE` on all application tables | Next.js CMS application runtime |
| **`doctorcheck_readonly`** | `SELECT` only on canonical tables (`articles`, `pages`, `doctors`, etc.) | Read-only analytics / backup / reporting |

*Note: Application runtime must never connect as PostgreSQL `superuser`.*

---

## 3. Deployment Sequence

1. **Pre-flight Check:** Run `npm run prod:check` in the build container.
2. **Database Backup:** Run automated backup prior to risky schema updates (`npm run db:backup`).
3. **Database Migration:** Apply additive Drizzle schema migrations (`npm run db:push` or migration runner).
4. **Application Build:** Execute `npm run check` (`eslint`, `tsc --noEmit`, `next build`).
5. **Zero-Downtime Swap:** Switch traffic to newly built container instances.
6. **Post-deploy Health Check:** Query `GET /api/health` and `GET /api/health/readiness` to verify 200 OK.

---

## 4. Media Storage Durability Policy

- **Legacy Repository Assets:** 52 legacy public images remain permanently versioned in the git repository at `/public/images/`. They are immutable and served statically.
- **CMS Uploaded Media:** Stored via `S3StorageAdapter` to object storage with SHA-256 content addressing, Sharp-generated thumbnails, and strict magic-byte validation.

---

## 5. Health & Readiness Monitoring

- **Liveness:** `GET /api/health`
  - Returns `200 OK` with uptime and timestamp.
  - Used by load balancers and Kubernetes liveness probes.
- **Readiness:** `GET /api/health/readiness`
  - Returns `200 OK` if PostgreSQL is reachable (`SELECT 1`) and storage configuration is valid. Returns `503 Service Unavailable` on database outage.
  - Excludes all sensitive infrastructure topology, usernames, and hostnames.

---

## 6. Backup & Recovery Policy

### Backup Schedule & Retention
- **Automated Snapshot:** Nightly automated backup generated via `npm run db:backup` or cloud provider managed backup (e.g., AWS RDS Automated Backups / Neon / Supabase).
- **Retention Tiers:**
  - Daily snapshots retained for 30 days.
  - Weekly snapshots retained for 12 weeks.
  - Monthly snapshots retained for 12 months.
- **Integrity Verification:** Every backup artifact is accompanied by a SHA-256 checksum file (`.sha256`).

### Backup Command
```bash
npm run db:backup
```

### Isolated Restore Drill
The restore procedure must be periodically tested using the automated restore drill:
```bash
npm run db:restore:verify
```
*Guaranteed Safety: The restore drill operates entirely inside a temporary test database and never touches the baseline production database.*

---

## 7. Recovery Targets (RPO / RTO)

| METRIC | TARGET | IMPLEMENTATION |
| :--- | :--- | :--- |
| **RPO (Recovery Point Objective)** | < 1 hour | Continuous WAL archiving + nightly automated database snapshot |
| **RTO (Recovery Time Objective)** | < 30 minutes | Infrastructure-as-Code database provisioning + automated restore scripts |

---

## 8. Disaster Recovery Step-by-Step Runbook

In the event of a catastrophic database failure or regional outage:

1. **Incident Declaration:** Acknowledge outage and notify medical operations team.
2. **Halt Mutating Operations:** Put CMS in maintenance mode if reachable.
3. **Provision Target Database:** Spin up replacement PostgreSQL instance with required extensions (`uuid-ossp`, `pgcrypto`).
4. **Locate Latest Verified Snapshot:** Retrieve the latest verified `.json` or `.dump` backup and verify its SHA-256 checksum.
5. **Execute Database Restore:** Apply schema and import table data using `scripts/restore-verify-db.ts` or `pg_restore`.
6. **Verify Data Integrity:**
   - Articles = 108
   - Doctors = 7
   - Packages = 9
   - Pages = 55
   - Categories = 30
   - Homepage Blocks = 7
7. **Verify Public Routes & Collisions:** Confirm that root collision URLs (`/kien-thuc-ung-thu-da-day/`, `/dau-thuong-vi/`) resolve accurately.
8. **Point Application:** Update `DATABASE_URL` in application environment and restart Next.js runtime.
9. **Verify Liveness & Readiness:** Confirm `GET /api/health` and `GET /api/health/readiness` return `200 OK`.
10. **Re-route Public DNS:** Shift production traffic to restored infrastructure and monitor logs.

---

## 9. Rollback Procedures

- **Application Code Rollback:** Revert Git commit or redeploy previous container image. Content in PostgreSQL remains active.
- **Content Revision Rollback:** In CMS admin, select the historical revision from the revision history table and click "Restore as Draft", then submit for medical review and publish.
- **Database Migration Rollback:** Apply targeted reverse DDL migration (if non-destructive) or restore from pre-migration snapshot into isolated staging before cutover.

---

## 10. Production Incident Response Checklist

- [ ] Check `/api/health` and `/api/health/readiness`
- [ ] Inspect server error logs (sanitized from passwords and secrets)
- [ ] Inspect `audit_logs` table for unexpected authentication failures or permission denials
- [ ] Verify CDN / Media public delivery status
- [ ] Check revalidation failure outbox (`SELECT * FROM revalidation_operations WHERE status = 'failed'`) and trigger retry if required
