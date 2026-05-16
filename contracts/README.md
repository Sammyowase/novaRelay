# Smart Contracts

## Stellar Soroban Contract

**Location:** `stellar-soroban/`

### Features
- Fee sponsorship quota management
- Admin-controlled quota initialization
- Atomic fee deduction with overflow protection
- Quota reset functionality

### Build
```bash
cd stellar-soroban
cargo build --target wasm32-unknown-unknown --release
```

### Test
```bash
cargo test
```

### Deploy
```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/fee_sponsorship.wasm \
  --network testnet
```

## Solana Anchor Program

**Location:** `solana-anchor/`

### Features
- Intent submission and tracking
- Relayer-authorized execution
- Status management (Pending → Completed/Failed)
- Transaction hash recording

### Build
```bash
cd solana-anchor
anchor build
```

### Test
```bash
anchor test
```

### Deploy
```bash
anchor deploy --provider.cluster devnet
```

## Rust Core Library

**Location:** `rust-core/`

### Features
- Shared types and validation
- Address validation (Stellar & Solana)
- Amount validation
- Intent data structures

### Build
```bash
cd rust-core
cargo build
```

### Usage
```rust
use nova_relay_core::{validate_stellar_address, validate_amount};

let valid = validate_stellar_address("GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H");
let amount = validate_amount("10.5")?;
```

## Integration with Backend

The backend RelayerService interacts with these contracts:

**Stellar:**
- Calls `deduct_fee` after successful transaction
- Checks `remaining` quota before execution

**Solana:**
- Calls `submit_intent` when intent created
- Calls `execute_intent` with tx hash on success
- Calls `fail_intent` on execution failure

## Contract Addresses

Set these in backend `.env`:

```bash
STELLAR_CONTRACT_ID=<deployed_contract_id>
SOLANA_PROGRAM_ID=GcCkgoKbDFeXzdmA3PdegAiMaZrTmeYh3kRrDN4UML9n
```
