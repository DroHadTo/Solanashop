import express from 'express';
import cors from 'cors';
import BigNumber from 'bignumber.js';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { findReference, validateTransfer } from '@solana/pay';

const app = express();
app.use(cors());

const CLUSTER = 'devnet'; // or 'mainnet-beta'
const connection = new Connection(clusterApiUrl(CLUSTER), 'confirmed');

const MERCHANT_WALLET = new PublicKey('89znXatBP5yXeA3JowynCwXTYqGSB833A9p96kfLcGkZ');
const USDC_MINT = new PublicKey(
  CLUSTER === 'devnet'
    ? '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
    : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
);

app.get('/verify', async (req, res) => {
  try {
    const { reference, amount } = req.query;
    if (!reference || !amount) return res.status(400).json({ ok: false, error: 'Missing params' });

    const refKey = new PublicKey(reference);
    const { signature } = await findReference(connection, refKey, { finality: 'confirmed' });

    await validateTransfer(
      connection,
      signature,
      {
        recipient: MERCHANT_WALLET,
        amount: new BigNumber(amount),
        splToken: USDC_MINT,
        reference: refKey
      },
      { commitment: 'confirmed' }
    );

    res.json({ ok: true, signature });
  } catch (e) {
    res.status(404).json({ ok: false, error: e.message });
  }
});

app.listen(8787, () => console.log('Verifier listening on :8787'));
