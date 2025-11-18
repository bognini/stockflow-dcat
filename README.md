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

#### Production cron setup

1. SSH into the VM and make the script executable:
   ```bash
   ssh deploy@172.23.98.146
   cd /var/www/stockflow
   chmod +x scripts/backup_db.sh
   ```
2. Add the daily job at 02:00 (fills `/var/log/stockflow_backup.log`):
   ```bash
   crontab -e
   # add:
   0 2 * * * cd /var/www/stockflow && ./scripts/backup_db.sh >> /var/log/stockflow_backup.log 2>&1
   ```
3. Confirm with `crontab -l` and check new dumps under `backups/`.

#### Verify nightly runs

- Inspect `/var/log/stockflow_backup.log` the next morning:
  ```bash
  sudo tail -n 50 /var/log/stockflow_backup.log
  ```
- List local backups (only the 7 newest should remain):
  ```bash
  ls -lh backups/
  ```
- If the cron job fails, the log will show the error and (with alerts configured below) you will receive an email.

#### Log rotation for backup logs

Create `/etc/logrotate.d/stockflow-backup` on the VM:

```
/var/log/stockflow_backup.log {
  weekly
  rotate 4
  compress
  missingok
  notifempty
}
```

This prevents the log file from growing indefinitely while keeping a month of history.

#### Cron failure alerts

At the top of `crontab -e`, set a `MAILTO` value so cron emails you when a backup run exits with a non-zero status:

```
MAILTO=alerts@dcat.ci
0 2 * * * cd /var/www/stockflow && ./scripts/backup_db.sh >> /var/log/stockflow_backup.log 2>&1
```

Configure your VM's MTA (e.g., `postfix` or `msmtp`) so outgoing mail reaches that address. Alternatively, replace `MAILTO` with a wrapper script that posts to Slack/Teams/Webhook if a failure occurs.

#### Optional off-site sync

Set these environment variables (e.g., append to `/var/www/stockflow/.env`) if you want backups copied to another host after each run:

```
BACKUP_REMOTE_HOST=backup.example.com
BACKUP_REMOTE_USER=backup
BACKUP_REMOTE_PATH=/srv/stockflow-backups
```

The script will `rsync -az --delete` the local `backups/` directory to the remote destination, ensuring both locations stay in sync.

For a Synology NAS target:

1. Enable SSH access on the NAS and create a dedicated `stockflow-backup` user with permissions to the destination shared folder.
2. From the VM, generate an SSH key (if not already present) and copy the public key to the NAS:
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/stockflow-backup
   ssh stockflow-backup@nas.example.com 'mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys' < ~/.ssh/stockflow-backup.pub
   ```
3. Set the following in `/var/www/stockflow/.env`:
   ```
   BACKUP_REMOTE_HOST=nas.example.com
   BACKUP_REMOTE_USER=stockflow-backup
   BACKUP_REMOTE_PATH=/volume1/backups/stockflow
   ```
4. Run `./scripts/backup_db.sh` once to perform the initial sync. Subsequent cron runs will automatically mirror `backups/` to the NAS.

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
