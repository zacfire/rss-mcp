import { get_feed } from './index';
import 'dotenv/config';

async function runTest() {
    const testUrl = 'zhihu/hot';
    console.log(`--- Running test for: ${testUrl} ---`);

    try {
        const feed = await get_feed({ url: testUrl });
        console.log("--- Test successful ---");
        console.log("--- Function Output: ---");
        console.log(JSON.stringify(feed, null, 2));

        // Let's simulate the client's expected structure
        const clientResponse = {
            structuredContent: feed
        };

        console.log("\n--- Simulated Client Response Payload: ---");
        console.log(JSON.stringify(clientResponse, null, 2));

    } catch (error) {
        console.error("--- Test failed ---");
        console.error(error);
    }
}

runTest();