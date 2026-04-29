# novaRelay — Architecture Overview

## System Diagram

```
Mobile App (Expo)
      │
      │  POST /intents
      ▼
┌─────────────────────────────────────────┐
│           NestJS Backend                │
│                                         │
│  IntentsModule  ──►  RoutingModule      │
│       │                   │             │
│       │            selects chain        │
│       ▼                   │             │
│  RelayerModule  ◄─────────┘             │
│       │                                 │
│  FeeSponsorshipModule                   │
│  (quota check + deduction)              │
└──────────┬──────────────────────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
 Stellar       Solana
 Soroban       Anchor
 Contract      Program
```

## Request Flow

1. **Intent Submission** — Mobile app posts a payment intent (`amount`, `asset`, `recipient`, `toChain`).
2. **Validation** — Backend validates the intent and persists it with status `pending`.
3. **Routing** — `RoutingService` evaluates available chains and selects the cheapest/fastest route.
4. **Fee Sponsorship Check** — `FeeSponsorshipService` verifies the tenant has remaining XLM quota.
5. **Relay** — `RelayerService` signs and submits the transaction to the target chain.
6. **Settlement** — On-chain contract marks the intent as executed; backend updates status to `completed`.

## Modules

### `IntentsModule`
- `POST /intents` — create a new intent
- `GET /intents/:id` — fetch intent status
- Persists intents to PostgreSQL via Prisma (TODO)

### `RoutingModule`
- Selects execution chain based on fee + latency estimates
- Pluggable strategy pattern (TODO: implement real fee oracle)

### `RelayerModule`
- Signs transactions using stored relayer keypair
- Submits to Stellar (Stellar SDK) or Solana (@solana/web3.js)
- Retry logic with exponential backoff (TODO)

### `FeeSponsorshipModule`
- Per-tenant XLM quota management
- Abuse protection: rate limiting + quota enforcement
- Mirrors on-chain quota state from Soroban contract (TODO)

## Contracts

### Stellar Soroban (`contracts/stellar-soroban`)
- `init_quota(tenant, limit_stroops)` — set per-tenant fee budget
- `deduct_fee(tenant, fee_stroops)` — atomic deduction with overflow guard
- `remaining(tenant)` — query remaining quota

### Solana Anchor (`contracts/solana-anchor`)
- `submit_intent(params)` — store intent PDA on-chain
- `execute_intent(intent_id)` — relayer marks intent as completed
- `initialize()` — one-time program setup

## Data Flow: Fee Sponsorship

```
User submits tx
      │
      ▼
FeeSponsorshipService.checkQuota(tenantId)
      │
      ├── quota OK ──► RelayerService.relay(intent)
      │                      │
      │                      ▼
      │               Stellar SDK: beginSponsoringFutureReserves
      │               + submit tx + endSponsoring
      │                      │
      │                      ▼
      │               FeeSponsorshipService.deductFee(tenantId, fee)
      │
      └── quota exceeded ──► 402 Payment Required
```

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma |
| Queue | BullMQ + Redis |
| Stellar | Soroban SDK (Rust) + Stellar SDK (TS) |
| Solana | Anchor (Rust) + @solana/web3.js |
| Infra | Docker + nginx |
