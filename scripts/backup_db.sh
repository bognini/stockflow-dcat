#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/backup_db.sh [/path/to/output/dir]
# Creates a compressed dump of the Postgres database from the running Docker container.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ -f "${REPO_ROOT}/.env" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${REPO_ROOT}/.env"
  set +a
fi

BACKUP_DIR="${1:-${REPO_ROOT}/backups}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-stockflow_dcat_db}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/stockflow_dcat_${TIMESTAMP}.sql.gz"
RETENTION_COUNT="${BACKUP_RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

echo "[backup] dumping database from container ${CONTAINER_NAME}..."
docker exec "$CONTAINER_NAME" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"

echo "[backup] backup stored at ${BACKUP_FILE}"

echo "[backup] applying retention policy (keep last ${RETENTION_COUNT})..."
mapfile -t BACKUP_FILES < <(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'stockflow_dcat_*.sql.gz' -printf '%T@ %p\n' | sort -k1,1nr | cut -d' ' -f2-)

INDEX=0
for FILE in "${BACKUP_FILES[@]}"; do
  INDEX=$((INDEX + 1))
  if (( INDEX > RETENTION_COUNT )); then
    echo "[backup] removing old backup ${FILE}"
    rm -f "$FILE"
  fi
done
