#!/usr/bin/env bash
set -euo pipefail

# certbot only actually renews within ~30 days of expiry (this is a no-op
# otherwise) — running it twice a day is Let's Encrypt's own recommended
# cadence, not overkill. See uu7-renew-cert.timer in this directory.
cd "$(dirname "$0")/../.."

docker compose --profile tools run --rm certbot renew --quiet
docker compose exec nginx nginx -s reload
