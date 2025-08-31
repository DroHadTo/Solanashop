// Script to help find the correct Pyth SOL/USD feed ID
// This will attempt to fetch from Pyth's API and suggest the correct ID

async function findCorrectSolUsdFeedId() {
  console.log('🔍 Searching for correct SOL/USD Pyth Feed ID...\n');

  try {
    // Try to get all available price feeds
    console.log('📡 Fetching all Pyth price feeds...');
    const response = await fetch('https://hermes.pyth.network/api/latest_price_feeds?verbose=true');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const allFeeds = await response.json();

    // Look for SOL/USD feeds
    const solFeeds = allFeeds.filter(feed =>
      feed.attributes?.symbol?.toLowerCase().includes('sol') &&
      feed.attributes?.symbol?.toLowerCase().includes('usd')
    );

    if (solFeeds.length > 0) {
      console.log('✅ Found SOL/USD feeds:');
      solFeeds.forEach((feed, index) => {
        console.log(`${index + 1}. ${feed.attributes.symbol}`);
        console.log(`   ID: ${feed.id}`);
        console.log(`   Price: $${feed.price.price}`);
        console.log(`   Updated: ${new Date(feed.price.publish_time * 1000).toLocaleString()}`);
        console.log();
      });

      // Suggest the first one
      const suggestedId = solFeeds[0].id;
      console.log('🎯 Suggested Feed ID to use:');
      console.log(suggestedId);
      console.log('\n📝 Copy this ID to your .env file:');
      console.log(`VITE_PYTH_SOL_USD_ID=${suggestedId}`);

    } else {
      console.log('❌ No SOL/USD feeds found in the response');
      console.log('💡 The API might have changed or feeds might be filtered differently');
    }

  } catch (error) {
    console.log('❌ Error fetching feeds:', error.message);
    console.log('\n🔗 Manual approach:');
    console.log('1. Visit: https://pyth.network/developers/price-feed-ids');
    console.log('2. Search for "SOL"');
    console.log('3. Find "SOL / USD" entry');
    console.log('4. Copy the ID column value');
  }
}

findCorrectSolUsdFeedId();
