### novaRelay — Cross-Chain Intent-Based Payment & Execution Layer

---


A high-performance, intent-driven execution system for cross-chain payments, fee sponsorship, and programmable transaction flows across Stellar and Solana. to express **intents** instead of raw transactions, while the system handles execution, optimization, and fee abstraction behind the scenes.

Instead of:

> “Send XLM to address B”

Users (or apps) say:

> “Pay $50 to Alice using the cheapest and fastest route available”

NovaRelay:

* Determines optimal execution path (Stellar ↔ Solana)
* Sponsors fees where needed
* Handles retries, failures, and fallback routes
* Ensures final settlement with strong guarantees

---

##  Core Features

### Intent-Based Execution Engine

* Accepts high-level payment or contract intents
* Routes execution across chains dynamically
* Supports multi-step workflows (swap → bridge → pay)

###  Gasless & Sponsored Transactions (Stellar)

* Built on Stellar fee sponsorship
* Backend relayers enforce quotas and abuse protection
* Enables seamless UX for end users

###  Cross-Chain Interoperability

* **Stellar (Soroban, Rust)** for payments & compliance
* **Solana** for high-throughput execution paths
* Modular adapters for adding new chains

### Smart Routing Engine

* Chooses cheapest/fastest route in real time
* Fallback strategies on failure
* Pluggable routing strategies

###  OCR + Receipt Intelligence

* Extract structured data from receipts/invoices
* Turn real-world data into executable payment intents

###  Secure Job Pipeline

* Queue-based processing for:

  * OCR
  * Transaction execution
  * Retry logic
* Fault-tolerant and horizontally scalable

###  Observability & Quotas

* Per-tenant limits (e.g. XLM fee quotas)
* Metrics, logging, and tracing
* Abuse prevention layer

---

##  Architecture

```
apps/
  mobile/            → React Native (Expo)
  backend/           → NestJS + Prisma (PostgreSQL)
  relayer/           → Transaction executor + queue workers

contracts/
  stellar/           → Soroban smart contracts (Rust)
  solana/            → Solana programs (Anchor)

packages/
  sdk/               → Shared TypeScript SDK
  types/             → Shared types/interfaces

infra/
  docker/            → Container setup
  nginx/             → Reverse proxy
```

---

##  Tech Stack

###  Frontend

* React Native (Expo)
* Zustand / React Query
* TypeScript

###  Backend

* NestJS
* PostgreSQL + Prisma ORM
* Redis (queues, caching)
* BullMQ / queue workers

###  Blockchain

#### Stellar

* Soroban smart contracts (Rust)
* Stellar SDK
* Fee sponsorship / transaction relayers

#### Solana

* Anchor framework
* @solana/web3.js
* Program Derived Addresses (PDAs)

###  Infra & Tooling

* Docker
* CI/CD pipelines
* Observability (logs + metrics)
* Flamegraphs for performance analysis

---

##  System Flow

1. User submits intent via mobile app
2. Backend validates + stores intent
3. Routing engine selects execution path
4. Job is queued for execution
5. Relayer processes:

   * Signs transactions
   * Sponsors fees if needed
   * Executes on-chain
6. Result is stored + returned to user

---

##  Example Use Cases

* Cross-border payments with automatic routing
*  Scan receipt → auto-pay vendor
*  Enterprise payout systems with quotas
* Retry-safe transaction execution pipelines
*  Multi-chain payment abstraction layer

---

##  Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/novarelay.git
cd novarelay
```

---

### 2. Setup Backend

```bash
cd apps/backend
npm install
cp .env.example .env
npm run dev
```

---

### 3. Setup Mobile App

```bash
cd apps/mobile
npm install
npx expo start
```

---

### 4. Setup Contracts

#### Stellar (Soroban)

```bash
cd contracts/stellar
cargo build
```

#### Solana

```bash
cd contracts/solana
anchor build
```

---

##  Environment Variables

Example `.env`:

```
DATABASE_URL=
REDIS_URL=
STELLAR_RPC_URL=
SOLANA_RPC_URL=
JWT_SECRET=
```

---

## 📊 Performance Goals

*  Sub-second transaction relay
*  Minimal memory allocations (zero-copy where possible)
*  Reliable retry mechanisms
*  High throughput (1000+ TPS target via batching & queues)

---

##  Key Engineering Principles

* **Zero-copy where possible** (especially in XDR handling)
* **Queue-first architecture** (no blocking flows)
* **Fail-safe execution** (rollback & retry guarantees)
* **Modular chain adapters**
* **Strict validation & security**

---

##  Testing

```bash
npm run test
```

Includes:

* Unit tests
* Property-based tests (fast-check)
* Integration tests

---

##  Contributing

We welcome contributors through structured issues:

*  Bug fixes
*  Performance optimizations
*  Security improvements
*  Testing (unit + property-based)
*  Documentation
*  New features

### Workflow

1. Fork repo
2. Create branch:

   ```
   feature/your-feature-name
   ```
3. Commit changes
4. Open PR (link to issue)

---

##  Planned Issues (Wave Scope)

* Fee sponsorship quota system (Stellar)
* OCR job pipeline (queue-based)
* Zero-copy XDR optimization (Rust)
* Cross-chain routing engine
* Deployment rollback safety (property tests)
* Mobile UX improvements
* Smart contract security hardening

---

##  Roadmap

* [ ] Intent batching
* [ ] AI-powered routing optimization
* [ ] Multi-tenant enterprise dashboards
* [ ] On-chain analytics
* [ ] Plugin system for new chains

---

##  Supporting Links

* Stellar Docs: [https://developers.stellar.org](https://developers.stellar.org)
* Solana Docs: [https://docs.solana.com](https://docs.solana.com)
* Anchor Framework: [https://www.anchor-lang.com](https://www.anchor-lang.com)
* Expo: [https://expo.dev](https://expo.dev)
* NestJS: [https://nestjs.com](https://nestjs.com)

---

## 🧑 Maintainers

* Samuel Owase (@Sammyowase)

---

##  License

MIT License

---

##  Built for Stellar Wave

This project is designed to:

* Provide **high-quality, scoped issues**
* Enable **meaningful contributor participation**
* Demonstrate **real-world blockchain + backend engineering**
* Maintain **production-level standards**

---

