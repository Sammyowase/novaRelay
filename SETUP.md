# NovaRelay Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- pnpm (for backend)
- npm (for mobile)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Configure Environment

```bash
cp ../.env.example .env
```

Edit `.env` and set:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` and `REDIS_PORT` - Redis connection
- `JWT_SECRET` - Strong random secret
- `STELLAR_RELAYER_SECRET` - Stellar testnet secret key
- `SOLANA_RELAYER_SECRET` - Solana devnet secret key (base58)

### 3. Setup Database

```bash
# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# (Optional) Seed data
pnpm prisma db seed
```

### 4. Start Services

```bash
# Start Redis (if not running)
redis-server

# Start backend
pnpm start:dev
```

Backend runs on `http://localhost:3000`

## Mobile App Setup

### 1. Install Dependencies

```bash
cd mobile
npm install --legacy-peer-deps
```

### 2. Configure API URL

Create `.env` in mobile directory:

```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start App

```bash
# Start Expo dev server
npm start

# Or run on specific platform
npm run ios
npm run android
npm run web
```

## Testing the System

### 1. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "tenantName": "Test Org"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from response.

### 3. Create Intent

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

### 4. Check Intent Status

```bash
curl http://localhost:3000/intents/INTENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Architecture

- **Database**: PostgreSQL stores users, tenants, and intents
- **Queue**: BullMQ processes intents asynchronously
- **Relayer**: Executes transactions on Stellar/Solana
- **Auth**: JWT-based authentication
- **Mobile**: React Native with Expo

## Key Features Implemented

✅ Database integration with Prisma  
✅ JWT authentication (register/login)  
✅ Intent persistence and tracking  
✅ BullMQ queue for async processing  
✅ Stellar SDK integration  
✅ Solana web3.js integration  
✅ Fee sponsorship with quota management  
✅ Mobile app with auth screens  
✅ Wallet integration ready  

## Next Steps

1. Generate Stellar and Solana keypairs for relayer
2. Fund relayer accounts on testnet/devnet
3. Test end-to-end transaction flow
4. Add error handling and retry logic
5. Implement monitoring and logging
