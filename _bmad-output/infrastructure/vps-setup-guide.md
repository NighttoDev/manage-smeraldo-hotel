# VPS Setup Guide — Smeraldo Hotel

Complete step-by-step instructions for setting up the self-hosted stack from scratch.

---

## Server Info

| Key | Value |
|-----|-------|
| Provider | VPS (manually provisioned) |
| IP | 103.47.225.24 |
| OS | Ubuntu 25.04 |
| Domain | smeraldohotel.online |
| GitHub | https://github.com/NighttoDev/Smeraldo-Hotel |
| App dir | /var/www/smeraldo-hotel/smeraldo-hotel |
| Supabase dir | /opt/supabase |

---

## Prerequisites

- Domain A record pointing to server IP
- Local machine: `sshpass` installed (`brew install sshpass`)
- Local machine: `gh` CLI authenticated

---

## Step 1: Install System Packages

```bash
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget gnupg2 ca-certificates lsb-release apt-transport-https software-properties-common ufw

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# Nginx + Certbot
apt-get install -y nginx certbot python3-certbot-nginx

# Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# PM2
npm install -g pm2
```

---

## Step 2: Supabase Self-Hosted

### 2a. Clone Docker files

```bash
cd /opt
git clone --depth 1 https://github.com/supabase/supabase supabase-repo
mkdir -p /opt/supabase
cp -rf /opt/supabase-repo/docker/* /opt/supabase/
rm -rf /opt/supabase-repo
```

### 2b. Generate secrets (run this Python snippet on the server)

```bash
python3 - << 'EOF'
import hmac, hashlib, base64, json, secrets

jwt_secret = secrets.token_hex(40)
postgres_password = secrets.token_urlsafe(32)
dashboard_password = secrets.token_urlsafe(16)
logflare_key = secrets.token_hex(20)
vault_key = secrets.token_hex(16)
pg_meta_key = secrets.token_hex(16)

def b64encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def sign_jwt(payload, secret):
    header = {"alg": "HS256", "typ": "JWT"}
    h = b64encode(json.dumps(header, separators=(",",":")).encode())
    p = b64encode(json.dumps(payload, separators=(",",":")).encode())
    msg = f"{h}.{p}".encode()
    sig = hmac.new(secret.encode(), msg, hashlib.sha256).digest()
    return f"{h}.{p}.{b64encode(sig)}"

anon_key = sign_jwt({"role":"anon","iss":"supabase","iat":1641769200,"exp":1956585200}, jwt_secret)
service_key = sign_jwt({"role":"service_role","iss":"supabase","iat":1641769200,"exp":1956585200}, jwt_secret)

print(f"POSTGRES_PASSWORD={postgres_password}")
print(f"JWT_SECRET={jwt_secret}")
print(f"ANON_KEY={anon_key}")
print(f"SERVICE_ROLE_KEY={service_key}")
print(f"DASHBOARD_PASSWORD={dashboard_password}")
print(f"LOGFLARE_KEY={logflare_key}")
print(f"VAULT_KEY={vault_key}")
print(f"PG_META_KEY={pg_meta_key}")
EOF
```

### 2c. Write /opt/supabase/.env

```env
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432
POSTGRES_PASSWORD=<generated>
POSTGRES_USER=supabase_admin

JWT_SECRET=<generated>
JWT_EXPIRY=28800
ANON_KEY=<generated>
SERVICE_ROLE_KEY=<generated>

SUPABASE_PUBLIC_URL=https://<your-domain>
API_EXTERNAL_URL=https://<your-domain>
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443
PGRST_DB_SCHEMAS=public,storage,graphql_public

SITE_URL=https://<your-domain>
ADDITIONAL_REDIRECT_URLS=
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_PHONE_SIGNUP=false
ENABLE_ANONYMOUS_USERS=false
ENABLE_EMAIL_AUTOCONFIRM=true
ENABLE_PHONE_AUTOCONFIRM=false
MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
MAILER_URLPATHS_INVITE=/auth/v1/verify
MAILER_URLPATHS_RECOVERY=/auth/v1/verify
MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify

STUDIO_DEFAULT_ORGANIZATION=<hotel name>
STUDIO_DEFAULT_PROJECT=<project-name>
DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=<generated>

SMTP_ADMIN_EMAIL=admin@<your-domain>
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SENDER_NAME=<hotel name>

# MUST be non-empty — empty value crashes supabase-vector and blocks entire stack
LOGFLARE_API_KEY=<generated>
LOGFLARE_PUBLIC_ACCESS_TOKEN=<generated>
LOGFLARE_PRIVATE_ACCESS_TOKEN=<generated>

SECRET_KEY_BASE=<jwt_secret>
VAULT_ENC_KEY=<generated>
PG_META_CRYPTO_KEY=<generated>

FUNCTIONS_VERIFY_JWT=false

POOLER_PROXY_PORT_TRANSACTION=6543
POOLER_MAX_CLIENT_CONN=100
POOLER_DB_POOL_SIZE=10
POOLER_DEFAULT_POOL_SIZE=20
POOLER_TENANT_ID=postgres

IMGPROXY_ENABLE_WEBP_DETECTION=false

DOCKER_SOCKET_LOCATION=/var/run/docker.sock
GOOGLE_PROJECT_ID=GOOGLE_PROJECT_ID
GOOGLE_PROJECT_NUMBER=GOOGLE_PROJECT_NUMBER
```

### 2d. Expose Studio on host port 3001

Create `/opt/supabase/docker-compose.override.yml`:

```yaml
services:
  studio:
    ports:
      - "127.0.0.1:3001:3000"
```

### 2e. Start the stack

```bash
cd /opt/supabase
docker compose pull
docker compose up -d
sleep 45  # Wait for DB init
docker compose ps   # All should show (healthy)
```

### 2f. Auto-start on boot

Create `/etc/systemd/system/supabase.service`:

```ini
[Unit]
Description=Supabase Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/supabase
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable supabase
```

---

## Step 3: Firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8088/tcp    # Supabase Studio
ufw --force enable
```

---

## Step 4: Nginx Config

Create `/etc/nginx/sites-available/smeraldo`:

```nginx
server {
    server_name <your-domain>;

    # SvelteKit app
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Supabase REST API
    location /rest/v1/ {
        proxy_pass http://127.0.0.1:8000/rest/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Auth
    location /auth/v1/ {
        proxy_pass http://127.0.0.1:8000/auth/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Realtime (WebSocket)
    location /realtime/v1/ {
        proxy_pass http://127.0.0.1:8000/realtime/v1/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Supabase Storage
    location /storage/v1/ {
        proxy_pass http://127.0.0.1:8000/storage/v1/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/<your-domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<your-domain>/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# Supabase Studio — dedicated port to avoid path-prefix redirect issues
server {
    listen 8088 ssl;
    server_name <your-domain>;

    ssl_certificate /etc/letsencrypt/live/<your-domain>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<your-domain>/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 900;
    }
}

# HTTP → HTTPS redirect
server {
    if ($host = <your-domain>) {
        return 301 https://$host$request_uri;
    }
    listen 80;
    server_name <your-domain>;
    return 404;
}
```

```bash
ln -sf /etc/nginx/sites-available/smeraldo /etc/nginx/sites-enabled/smeraldo
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

---

## Step 5: TLS Certificate

> DNS A record must resolve to server IP before running this.

```bash
# Apex domain only
certbot --nginx -d <your-domain> \
  --non-interactive --agree-tos --email admin@<your-domain> \
  --redirect

# If www CNAME also exists, add it:
# certbot --nginx -d <your-domain> -d www.<your-domain> ...
```

Auto-renewal is configured automatically by certbot via systemd timer.

---

## Step 6: Deploy SvelteKit App

### 6a. Clone repo and create .env

```bash
cd /var/www
git clone https://github.com/NighttoDev/Smeraldo-Hotel.git smeraldo-hotel
cd smeraldo-hotel/smeraldo-hotel

cat > .env << 'EOF'
PUBLIC_SUPABASE_URL=https://<your-domain>
PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=postgresql://supabase_admin:<postgres-password>@localhost:5432/postgres
EOF
```

### 6b. Build and start with PM2

```bash
npm ci
npm run build

cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: "smeraldo-hotel",
    script: "build/index.js",
    cwd: "/var/www/smeraldo-hotel/smeraldo-hotel",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      HOST: "127.0.0.1"
    },
    env_file: "/var/www/smeraldo-hotel/smeraldo-hotel/.env"
  }]
};
EOF

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root
systemctl enable pm2-root
```

---

## Step 7: GitHub Actions CI/CD

### 7a. Generate SSH deploy key on VPS

```bash
ssh-keygen -t ed25519 -C "github-actions" -f /root/.ssh/github_actions -N ""
cat /root/.ssh/github_actions.pub >> /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys
cat /root/.ssh/github_actions   # copy this — it's the private key
```

### 7b. Set GitHub secrets (from local machine with gh CLI)

```bash
gh secret set SSH_PRIVATE_KEY --body "$(cat /root/.ssh/github_actions)" --repo NighttoDev/Smeraldo-Hotel
gh secret set VPS_HOST --body "103.47.225.24" --repo NighttoDev/Smeraldo-Hotel
gh secret set VPS_USER --body "root" --repo NighttoDev/Smeraldo-Hotel
```

### 7c. deploy.yml key requirements

- All `npm` steps need `working-directory: smeraldo-hotel` (app is in a subdirectory)
- SSH deploy script must `cd smeraldo-hotel` after `git pull`

---

## Endpoints

| URL | Service |
|-----|---------|
| `https://smeraldohotel.online/` | SvelteKit app |
| `https://smeraldohotel.online:8088/` | Supabase Studio (user: `supabase`) |
| `https://smeraldohotel.online/rest/v1/` | PostgREST API |
| `https://smeraldohotel.online/auth/v1/` | Supabase Auth |
| `https://smeraldohotel.online/realtime/v1/` | Realtime WebSocket |
| `https://smeraldohotel.online/storage/v1/` | Storage |

---

## Common Operations

```bash
# Restart app
pm2 reload smeraldo-hotel

# View app logs
pm2 logs smeraldo-hotel

# Restart Supabase
cd /opt/supabase && docker compose restart

# View Supabase logs
cd /opt/supabase && docker compose logs -f --tail=50

# Renew TLS manually
certbot renew

# Full manual redeploy
cd /var/www/smeraldo-hotel && git pull origin main
cd smeraldo-hotel && npm ci && npm run build
pm2 reload smeraldo-hotel
```

---

## Gotchas & Lessons Learned

1. **`LOGFLARE_API_KEY` must not be empty** — even when not using Logflare. An empty value causes `supabase-vector` to crash with a config error, which blocks the entire stack from starting.

2. **Supabase Studio behind a path prefix breaks** — Studio redirects internally to `/project/default`, stripping any path prefix. Always use a **dedicated port** (e.g., 8088) rather than a path like `/studio/`.

3. **`docker-compose.override.yml` for Studio port** — Don't modify the main `docker-compose.yml`. Use an override file to expose Studio: `127.0.0.1:3001:3000`.

4. **`www.` subdomain needs its own DNS record** — Certbot fails if you include `-d www.<domain>` without a CNAME or A record for `www`.

5. **GitHub Actions `working-directory`** — The SvelteKit app lives in a subdirectory of the repo (`smeraldo-hotel/`). Every npm step needs `working-directory: smeraldo-hotel`.

6. **Supabase Studio not exposed by default** — Port 3000 inside Docker is NOT mapped to the host by default. Must use `docker-compose.override.yml`.

7. **PM2 `env_file` loads on start only** — After changing `.env`, run `pm2 reload smeraldo-hotel` to apply new environment variables.
