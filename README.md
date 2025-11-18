# StockFlow DCAT - Application de Gestion de Stock

This is a Next.js application for inventory management, built for DCAT.

## Features

- Role-based authentication (Admin, Marketing, Technician).
- Inventory dashboard with key metrics and charts.
- Advanced product management with detailed attributes.
- Stock entry and exit tracking.
- Management of clients, projects, manufacturers, and vendors.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- ShadCN UI
- Lucide React Icons
- Recharts for charts

## Runbook & Operations

### Local development

```bash
npm install
npm run dev
```

### Docker deployment

```bash
docker compose build
docker compose up -d
```

Production VM commands (run after pushing to `main`):

```bash
ssh deploy@172.23.98.146
cd /var/www/stockflow
git pull origin main
docker compose build
docker compose up -d
```

### Health check & monitoring

- `/api/health` returns `{ status: 'ok' }` when the app **and** Postgres respond.
- UptimeRobot (or any monitor) should hit `https://gestion.dcat.ci/api/health` every minute.
- Update firewall rules whenever your monitoring provider changes probe IPs.

### Automated backups

Create compressed dumps from the running PostgreSQL container:

```bash
./scripts/backup_db.sh # stores files in ./backups by default
```

Environment variables are loaded from `.env`. Override the output directory via `./scripts/backup_db.sh /path/to/backups`.

Restore example:

```bash
gzip -dc backups/stockflow_dcat_<timestamp>.sql.gz | docker exec -i stockflow_dcat_db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

Schedule the script via cron on the VM to keep daily snapshots, then copy them to off-site storage.

### CI checks

GitHub Actions run before each merge/push:

- `npm run lint`
- `npm run typecheck`

See `.github/workflows/ci.yml` for details.

### Incident checklist

1. Check `/api/health` (or UptimeRobot alert) to confirm outage.
2. Inspect `docker compose ps` and `docker logs <service>` on the VM.
3. If database corruption is suspected, restore the most recent dump from `./backups`.
4. After mitigation, redeploy via the commands shown above.
