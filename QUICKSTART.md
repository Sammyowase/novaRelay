# Quick Start Guide

## Prerequisites
```bash
# Install dependencies
node -v  # v18+
docker --version
```

## 1. Start Infrastructure (5 min)

```bash
# PostgreSQL
docker run -d --name novarelay-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=novarelay \
  -p 5432:5432 postgres:14

# Redis
docker run -d --name novarelay-redis \
  -p 6379:6379 redis:6
```

## 2. Setup Backend (5 min)

```bash
cd backend

# Install
pnpm install

# Configure
cp ../.env.example .env
# Edit .env and set DATABASE_URL, REDIS_HOST, JWT_SECRET

# Database
pnpm prisma generate
pnpm prisma migrate dev

# Build
pnpm build

# Start
pnpm start:dev
```

Backend runs on `http://localhost:3000`

## 3. Setup Mobile (3 min)

```bash
cd mobile

# Install
npm install --legacy-peer-deps

# Configure
echo "EXPO_PUBLIC_API_URL=http://localhost:3000" > .env

# Start
npm start
```

## 4. Test the System (2 min)

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "tenantName": "Test Org"
  }'
```

Save the `access_token` from response.

### Create Intent
```bash
curl -X POST http://localhost:3000/intents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fromChain": "stellar",
    "toChain": "solana",
    "amount": "10",
    "asset": "XLM",
    "recipient": "RECIPIENT_ADDRESS"
  }'
```

### Check Status
```bash
curl http://localhost:3000/intents/INTENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 5. Mobile App

1. Open Expo app on phone
2. Scan QR code
3. Register account
4. Submit intent
5. View history

## Troubleshooting

**Database connection failed:**
```bash
docker ps  # Check if postgres is running
docker logs novarelay-db
```

**Redis connection failed:**
```bash
docker ps  # Check if redis is running
docker logs novarelay-redis
```

**Build errors:**
```bash
cd backend
rm -rf node_modules dist
pnpm install
pnpm build
```

**Mobile install errors:**
```bash
cd mobile
rm -rf node_modules
npm install --legacy-peer-deps
```

## What's Working

✅ User registration and login  
✅ JWT authentication  
✅ Intent creation and persistence  
✅ Queue-based async processing  
✅ Database storage  
✅ Mobile app with auth  

## What Needs Configuration

⚠️ Stellar relayer keypair (for actual transactions)  
⚠️ Solana relayer keypair (for actual transactions)  
⚠️ Fund relayer accounts on testnet/devnet  

## Next Steps

1. Generate blockchain keypairs
2. Fund relayer accounts
3. Test end-to-end transaction flow
4. Add monitoring and logging
5. Deploy to staging environment

---

**Total Setup Time:** ~15 minutes  
**Ready for:** Development and testing
