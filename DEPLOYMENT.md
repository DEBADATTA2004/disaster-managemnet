# ResqNet Deployment Guide

Complete guide for deploying ResqNet to production environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Vercel Deployment](#vercel-deployment)
3. [Docker](#docker)
4. [Traditional Server](#traditional-server)
5. [AWS Deployment](#aws-deployment)
6. [Monitoring & Logs](#monitoring--logs)
7. [Scaling](#scaling)

---

## Local Development

### Setup

```bash
# Clone repository
git clone https://github.com/DEBADATTA2004/disaster-managemnet.git
cd disaster-managemnet

# Install dependencies
npm install

# Start server
npm start
```

Server runs on `http://localhost:3000`

### Environment Variables

Create `.env` file:
```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
```

---

## Vercel Deployment

### Free, Fast, and Simple ✨

**Prerequisites:**
- Vercel account (free)
- GitHub repository

### Step 1: Prepare Code

Already done! We have `vercel.json` configured.

### Step 2: Deploy

**Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Click "Deploy"

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Step 3: Access Your App

Your URL will be: `https://disaster-managemnet.vercel.app`

**Note:** Socket.io on Vercel uses websocket with fallback to long-polling. Works great for up to 100 concurrent connections.

---

## Docker

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build image
docker build -t resqnet:latest .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  resqnet:latest
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  resqnet:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      LOG_LEVEL: info
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

**Run:**
```bash
docker-compose up -d
```

---

## Traditional Server

### Ubuntu/Debian Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm

# Clone repository
git clone https://github.com/DEBADATTA2004/disaster-managemnet.git
cd disaster-managemnet

# Install dependencies
npm install

# Install PM2(process manager)
sudo npm install -g pm2

# Start app with PM2
pm2 start server.js --name "resqnet" --instances max

# Make PM2 start on boot
pm2 startup
pm2 save
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/TLS with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## AWS Deployment

### EC2 Setup

```bash
# Launch EC2 instance (Ubuntu 20.04)
# Update .pem file permissions
chmod 400 your-key.pem

# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow Ubuntu/Debian setup above
```

### Elastic Container Service (ECS)

1. Create ECR repository
2. Push Docker image
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer

### RDS (Optional - for message persistence)

If adding database support in future:

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier resqnet-db \
  --engine postgres \
  --db-instance-class db.t3.micro
```

---

## Monitoring & Logs

### PM2 Logs

```bash
# View logs
pm2 logs resqnet

# Clear logs
pm2 flush

# Save logs
pm2 save
```

### Vercel Logs

```bash
# View deployment logs
vercel logs

# Real-time logs
vercel logs --follow
```

### Docker Logs

```bash
# View container logs
docker logs <container-id>

# Follow logs
docker logs -f <container-id>
```

### Application Logging

Add to `.env`:
```env
LOG_LEVEL=info    # debug, info, warn, error
LOG_FORMAT=json   # simple or json
```

Monitor in production:
```bash
# Error logs only
tail -f logs/error.log | grep ERROR

# Real-time stats
pm2 monit
```

---

## Scaling

### Vertical Scaling (More Powerful Server)

- Increase CPU/RAM
- Upgrade Node.js version
- Optimize code performance

### Horizontal Scaling (Multiple Servers)

#### Using PM2 Cluster Mode

```bash
pm2 start server.js -i max  # -i = instances (use all CPU cores)
```

#### Load Balancing with Nginx

```nginx
upstream resqnet {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://resqnet;
    }
}
```

#### Redis Adapter (for multiple server instances)

Coming soon! We'll add Redis support for Socket.io message distribution.

---

## Performance Optimization

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Enable gzip compression
- [ ] Use reverse proxy (Nginx)
- [ ] Setup SSL/TLS
- [ ] Configure monitoring
- [ ] Setup automated backups
- [ ] Configure rate limiting
- [ ] Enable CORS properly
- [ ] Use PM2 or Docker
- [ ] Setup auto-restart on crash

### Database (Future)

- [ ] Add message persistence
- [ ] Setup database replication
- [ ] Configure indexes
- [ ] Setup automated backups

---

## Rollback Procedure

```bash
# With PM2
pm2 restart resqnet

# With Docker
docker-compose down
docker-compose up -d

# With Vercel
vercel rollback
```

---

## Security Checklist

- [ ] Update dependencies: `npm audit fix`
- [ ] Use environment variables for secrets
- [ ] Setup firewall rules
- [ ] Enable logging and monitoring
- [ ] Regular security updates
- [ ] Backup critical data
- [ ] Test disaster recovery procedure
- [ ] Implement rate limiting
- [ ] Enable HTTPS only
- [ ] Setup DDoS protection

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 3000
sudo lsof -i :3000
sudo kill -9 <PID>
```

### High Memory Usage

```bash
# Check memory
pm2 monit

# Restart app
pm2 restart resqnet
```

### Connection Timeouts

- Check firewall rules
- Verify reverse proxy config
- Check network connectivity
- Increase timeout in client code

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew --force-renewal
```

---

## Support

For deployment issues:
- Check logs: `pm2 logs` or `docker logs`
- Review monitoring dashboard
- Check system resources
- Verify network connectivity

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-13  
**Maintained by:** ResqNet Team
