import { Injectable, Logger } from '@nestjs/common';
import * as StellarSdk from 'stellar-sdk';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import * as bs58 from 'bs58';
import { Intent } from '../intents/intents.service';

export type RelayResult = {
  txHash: string | null;
  success: boolean;
  error?: string;
};

@Injectable()
export class RelayerService {
  private readonly logger = new Logger(RelayerService.name);
  private stellarServer: any;
  private solanaConnection: Connection;

  constructor() {
    this.stellarServer = new (StellarSdk as any).Server(
      process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
    );
    this.solanaConnection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed',
    );
  }

  async relay(intent: Intent): Promise<RelayResult> {
    this.logger.log(`Relaying intent ${intent.id} on ${intent.toChain}`);
    
    try {
      if (intent.toChain === 'stellar') {
        return await this.relayStellar(intent);
      } else {
        return await this.relaySolana(intent);
      }
    } catch (error) {
      this.logger.error(`Relay failed: ${error.message}`);
      return { txHash: null, success: false, error: error.message };
    }
  }

  private async relayStellar(intent: Intent): Promise<RelayResult> {
    const relayerSecret = process.env.STELLAR_RELAYER_SECRET;
    if (!relayerSecret) {
      throw new Error('STELLAR_RELAYER_SECRET not configured');
    }

    const SDK = StellarSdk as any;
    const sourceKeypair = SDK.Keypair.fromSecret(relayerSecret);
    const sourceAccount = await this.stellarServer.loadAccount(sourceKeypair.publicKey());

    const transaction = new SDK.TransactionBuilder(sourceAccount, {
      fee: SDK.BASE_FEE,
      networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || SDK.Networks.TESTNET,
    })
      .addOperation(
        SDK.Operation.payment({
          destination: intent.recipient,
          asset: SDK.Asset.native(),
          amount: intent.amount,
        }),
      )
      .setTimeout(30)
      .build();

    transaction.sign(sourceKeypair);
    const result = await this.stellarServer.submitTransaction(transaction);

    return {
      txHash: result.hash,
      success: result.successful,
    };
  }

  private async relaySolana(intent: Intent): Promise<RelayResult> {
    const relayerSecret = process.env.SOLANA_RELAYER_SECRET;
    if (!relayerSecret) {
      throw new Error('SOLANA_RELAYER_SECRET not configured');
    }

    const secretKey = (bs58 as any).decode(relayerSecret);
    const relayerKeypair = Keypair.fromSecretKey(secretKey);
    const recipientPubkey = new PublicKey(intent.recipient);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: relayerKeypair.publicKey,
        toPubkey: recipientPubkey,
        lamports: parseFloat(intent.amount) * 1e9,
      }),
    );

    const signature = await this.solanaConnection.sendTransaction(transaction, [relayerKeypair]);
    await this.solanaConnection.confirmTransaction(signature);

    return {
      txHash: signature,
      success: true,
    };
  }
}
