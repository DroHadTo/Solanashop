// Quick verification script for Pyth SOL/USD feed ID
// Run with: node verify-feed-id.js

// Common SOL/USD feed IDs to try (get the correct one from Pyth website)
const COMMON_FEED_IDS = [
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56fd', // Current
  '0ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56fd', // With 0x
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56fd', // Alternative
];

async function testFeedId(feedId) {
  const url = `https://hermes.pyth.network/api/latest_price_feeds?ids[]=${feedId}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const priceData = data[0];
      return {
        success: true,
        data: {
          id: priceData.id,
          price: priceData.price.price,
          confidence: priceData.price.conf,
          timestamp: new Date(priceData.price.publish_time * 1000).toLocaleString()
        }
      };
    } else {
      return { success: false, error: 'No data returned' };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function verifyAllFeedIds() {
  console.log('� Testing multiple Pyth SOL/USD Feed IDs...\n');

  for (const feedId of COMMON_FEED_IDS) {
    console.log(`📡 Testing: ${feedId}`);

    const result = await testFeedId(feedId);

    if (result.success) {
      console.log('✅ VALID FEED ID FOUND!');
      console.log('📊 Price Data:');
      console.log(`   ID: ${result.data.id}`);
      console.log(`   Price: $${Number(result.data.price).toFixed(2)}`);
      console.log(`   Confidence: ±$${Number(result.data.confidence).toFixed(4)}`);
      console.log(`   Updated: ${result.data.timestamp}`);
      console.log('\n🎉 Use this feed ID in your .env file!');
      return feedId;
    } else {
      console.log(`❌ Invalid: ${result.error}`);
    }
    console.log();
  }

  console.log('❌ No valid feed IDs found');
  console.log('💡 Visit https://pyth.network/developers/price-feed-ids to get the current SOL/USD feed ID');
  return null;
}

verifyAllFeedIds();
