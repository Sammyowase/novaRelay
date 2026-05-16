# 🚀 NovaRelay - Quick Reference Card

## One-Command Setup

```bash
# Clone and setup everything
git clone <repo> && cd flux-ledger

# Start infrastructure
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=novarelay postgres:14
docker run -d -p 6379:6379 redis:6

# Backend
cd backend && pnpm install && pnpm prisma generate && pnpm prisma migrate dev && pnpm start:dev &

# Mobile
cd ../mobile && npm install --legacy-peer-deps && npm start
```

## API Endpoints

### Auth
```bash
POST /auth/register  # Register new user
POST /auth/login     # Login user
```

### Intents
```bash
POST /intents        # Create intent (requires auth)
GET  /intents        # List intents (requires auth)
GET  /intents/:id    # Get intent by ID (requires auth)
```

## Example Requests

### Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","tenantName":"My Org"}'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'
```

### Create Intent
```bash
curl -X POST http://localhost:3000/intents \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromChain":"stellar",
    "toChain":"solana",
    "amount":"10",
    "asset":"XLM",
    "recipient":"RECIPIENT_ADDRESS"
  }'
```

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/novarelay
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_RELAYER_SECRET=<your-stellar-secret>
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_RELAYER_SECRET=<your-solana-secret-base58>
```

### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Build Commands

```bash
# Backend
cd backend && pnpm build

# Mobile
cd mobile && npm run android  # or ios, web

# Stellar Contract
cd contracts/stellar-soroban
cargo build --target wasm32-unknown-unknown --release

# Solana Program
cd contracts/solana-anchor
anchor build

# Rust Core
cd rust-core && cargo build
```

## Test Commands

```bash
# Backend
cd backend && pnpm test

# Contracts
cd contracts/stellar-soroban && cargo test
cd rust-core && cargo test
```

## Deploy Commands

### Stellar
```bash
cd contracts/stellar-soroban
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/fee_sponsorship.wasm \
  --network testnet \
  --source ADMIN_SECRET
```

### Solana
```bash
cd contracts/solana-anchor
anchor deploy --provider.cluster devnet
```

## Troubleshooting

### Database connection failed
```bash
docker ps  # Check if postgres is running
docker logs <container-id>
```

### Redis connection failed
```bash
docker ps  # Check if redis is running
redis-cli ping  # Should return PONG
```

### Build errors
```bash
# Backend
rm -rf node_modules dist && pnpm install && pnpm build

# Mobile
rm -rf node_modules && npm install --legacy-peer-deps
```

## Project Structure

```
flux-ledger/
├── backend/          # NestJS API
├── mobile/           # React Native app
├── contracts/        # Smart contracts
│   ├── stellar-soroban/
│   └── solana-anchor/
└── rust-core/        # Shared utilities
```

## Key Files

- `backend/src/app.module.ts` - Main app module
- `backend/prisma/schema.prisma` - Database schema
- `mobile/lib/api.ts` - API client
- `contracts/stellar-soroban/src/lib.rs` - Stellar contract
- `contracts/solana-anchor/programs/solana-anchor/src/lib.rs` - Solana program

## Status Indicators

✅ Complete and working  
⚠️  Needs configuration  
❌ Not implemented  

## Quick Links

- Backend: http://localhost:3000
- Mobile: Expo DevTools
- Docs: See README.md files in each directory

---

**Need help?** Check SETUP.md or QUICKSTART.md
