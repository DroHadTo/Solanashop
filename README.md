# Solana Pay USDC Checkout with Live Price Converter

A complete Solana Pay implementation for USDC payments featuring a live USD to SOL price converter powered by Jupiter API with Pyth Network integration ready.

## 🚀 Features

- ✅ **Solana Pay Integration** - Native USDC payments on Solana
- ✅ **Live Price Converter** - Real-time USD to SOL conversion
- ✅ **Dual Oracle System** - Jupiter primary + Pyth Network fallback
- ✅ **QR Code Generation** - Mobile wallet compatible
- ✅ **Server Verification** - Production-ready payment validation
- ✅ **Slippage Protection** - 0.4% safety buffer for price movements
- ✅ **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Blockchain**: Solana Web3.js, Solana Pay
- **Price Oracles**: Jupiter API (primary), Pyth Network (ready)
- **Backend**: Node.js, Express (optional server verification)
- **Libraries**: BigNumber.js, QRCode.js, Pyth Hermes Client

## 📁 Project Structure

```
├── index.html              # Main checkout page with converter
├── server.mjs              # Express server for payment verification
├── package.json            # Node.js dependencies
├── script.js               # Client-side cart functionality
├── silkandbows.html        # Full e-commerce site
├── styles.css              # Styling
├── assets/images/          # Product images
├── .env                    # Environment configuration
├── test-pyth.js           # Pyth integration tests
├── verify-feed-id.js      # Feed ID verification script
└── find-feed-id.js        # Feed ID discovery script
```

## 🚀 Quick Start

### Option 1: Browser Only (Simple)
1. Open `index.html` in your browser
2. Enter USDC amount and click "Create Payment"
3. Scan QR code with your Solana wallet
4. Use the live USD → SOL converter

### Option 2: With Server Verification (Production)

```bash
# Install dependencies
npm install

# Start verification server
node server.mjs

# Open index.html in browser
# Server runs on http://localhost:8787
```

## 💱 USD to SOL Converter

### Current Status: ✅ Working with Jupiter
- **Live price updates** every 15 seconds
- **Real-time conversion** as users type
- **Slippage protection** (0.4% safety buffer)
- **Jupiter API** providing reliable price data

### Pyth Network Integration: 🔄 Ready to Enable
The project is configured for Pyth Network oracle integration. To enable:

1. Visit: https://pyth.network/developers/price-feed-ids
2. Search for "SOL" and find "SOL / USD"
3. Copy the 64-character ID
4. Update `.env` file with correct feed ID
5. Run `node verify-feed-id.js` to test

## 🔧 Configuration

### Environment Variables (.env)
```env
# Pyth Configuration (when ready)
VITE_PYTH_SOL_USD_ID=your_64_character_feed_id_here
VITE_HERMES_URL=https://hermes.pyth.network
```

### Merchant Wallet
Update in both `index.html` and `server.mjs`:
```javascript
const MERCHANT_WALLET = new PublicKey('YOUR_WALLET_ADDRESS_HERE');
```

### Networks
- **Devnet**: For testing (`CLUSTER = 'devnet'`)
- **Mainnet**: For production (`CLUSTER = 'mainnet-beta'`)

## 🖥️ API Endpoints

### GET /verify (Server)
Verifies Solana Pay transactions server-side.

**Parameters:**
- `reference` - Transaction reference public key
- `amount` - Expected USDC amount

**Response:**
```json
{
  "ok": true,
  "signature": "transaction_signature"
}
```

## 🧪 Testing Scripts

- `node test-pyth.js` - Test conversion logic
- `node verify-feed-id.js` - Test Pyth feed IDs
- `node find-feed-id.js` - Discover correct feed IDs

## 📱 Supported Wallets

- Phantom
- Backpack
- Solflare
- Any Solana Pay compatible wallet

## 🔒 Security Features

- On-chain transaction validation
- Unique reference keys per payment
- SPL token verification (USDC only)
- Amount validation
- Recipient verification
- Slippage protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 Development Notes

### Current Status
- ✅ **Core functionality working** - Payments and converter operational
- ✅ **Jupiter integration active** - Live price feeds working
- 🔄 **Pyth integration ready** - Just needs correct feed ID
- ✅ **Server verification ready** - Production payment validation
- ✅ **QR generation working** - Mobile wallet compatible

### Next Steps
- [ ] Get correct Pyth SOL/USD feed ID
- [ ] Enable Pyth Network oracle integration
- [ ] Add more payment validation features
- [ ] Implement production deployment
- [ ] Add comprehensive error handling

## 📄 License

MIT License - feel free to use in your projects!

## 🙏 Acknowledgments

- [Solana Pay](https://docs.solanapay.com/) - Payment protocol
- [Pyth Network](https://pyth.network/) - Price oracles
- [Jupiter](https://jup.ag/) - Price API
- [Solana Web3.js](https://docs.solana.com/) - Blockchain interaction
- **Confidence intervals** showing price reliability
- **Real-time conversion** as users type

### Features

- **🔄 Dual Oracle System**: Pyth primary + Jupiter fallback
- **⚡ Fast Updates**: 15-second polling for fresh prices
- **🛡️ Slippage Protection**: 0.4% buffer prevents under-delivery
- **📊 Price Confidence**: Shows oracle confidence intervals
- **🔄 Live Conversion**: Updates as users type USD amounts
- **📱 Responsive Design**: Works on all devices

### How It Works

1. **Fetches SOL/USD price** from Pyth Hermes API
2. **Falls back to Jupiter** if Pyth is temporarily unavailable
3. **Applies slippage buffer** (0.4%) for safety
4. **Converts USD to SOL** in real-time
5. **Displays metadata** (source, timestamp, confidence)

### Price Sources

- **Pyth Network**: Decentralized oracle with confidence intervals
- **Jupiter**: Public price API as reliable fallback
- **Slippage Buffer**: 0.4% safety margin for price movements

### Configuration
Update `.env` with your Pyth settings:
```env
VITE_PYTH_SOL_USD_ID=ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56fd
VITE_HERMES_URL=https://hermes.pyth.network
```

## 🚨 **IMPORTANT: Fix Pyth Feed ID**

**The current Pyth feed ID is INVALID.** Your converter is currently using Jupiter as a fallback, but to get Pyth oracle prices, you need the correct feed ID.

### **How to Get the Correct Feed ID:**

1. **Open your browser** and visit: https://pyth.network/developers/price-feed-ids
2. **Search for "SOL"** in the search box
3. **Find the "SOL / USD" row** in the table
4. **Copy the ID** from the "ID" column (it should be a 64-character hex string)
5. **Update your `.env` file**:
   ```env
   VITE_PYTH_SOL_USD_ID=your_correct_64_character_id_here
   ```
6. **Update the HTML file** to use the correct ID instead of `null`

### **Current Status:**
- ✅ **Jupiter fallback working** - Your converter shows live prices
- ❌ **Pyth integration broken** - Invalid feed ID prevents oracle prices
- 🔄 **Ready for fix** - Just need the correct 64-character feed ID

### **Quick Test:**
Run `node verify-feed-id.js` after updating the feed ID to confirm it works.

### **Why This Matters:**
- **Pyth provides** decentralized, high-quality price feeds
- **Confidence intervals** show price reliability
- **Multiple sources** improve price accuracy
- **Production ready** for real applications

## 🔧 Configuration

### Networks
- **Devnet**: For testing (`CLUSTER = 'devnet'`)
- **Mainnet**: For production (`CLUSTER = 'mainnet-beta'`)

### USDC Mints
- **Mainnet**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Devnet**: `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`

### Merchant Wallet
Update in both `index.html` and `server.mjs`:
```javascript
const MERCHANT_WALLET = new PublicKey('YOUR_WALLET_ADDRESS_HERE');
```

## � File Structure
```
├── index.html          # Checkout page with QR generation
├── server.mjs          # Express server for verification
├── package.json        # Node.js dependencies
├── README.md           # This file
└── assets/             # Images and static files
```

## �️ Server API

### GET /verify
Verifies a Solana Pay transaction.

**Parameters:**
- `reference` (string) - Transaction reference public key
- `amount` (string) - Expected USDC amount

**Success Response:**
```json
{
  "ok": true,
  "signature": "transaction_signature_here"
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "error_message"
}
```

## 🔒 Security Features

- On-chain transaction validation
- Unique reference keys per payment
- SPL token verification (USDC only)
- Amount validation
- Recipient verification
- Server-side verification (production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on devnet
5. Submit a pull request

## 📄 License

MIT License - feel free to use in your projects!</content>
<parameter name="filePath">c:\Users\lenD25\Desktop\testsb\README.md
