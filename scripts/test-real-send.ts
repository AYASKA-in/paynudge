import dotenv from 'dotenv';
import path from 'path';
import axios from 'axios';

// Load environmental variables from the main project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testHelloWorldMessage() {
  console.log("🔍 Checking environment parameters...");
  const phoneId = process.env.META_WA_PHONE_NUMBER_ID;
  const token = process.env.META_WA_ACCESS_TOKEN;

  if (!phoneId || !token) {
    console.error("❌ PHONE_NUMBER_ID or ACCESS_TOKEN is missing!");
    return;
  }

  const cleanedPhone = '8148177828';
  const metaUrl = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  console.log(`🚀 Dispatching Meta's pre-approved 'hello_world' template to: ${cleanedPhone}...`);

  try {
    const response = await axios.post(
      metaUrl,
      {
        messaging_product: 'whatsapp',
        to: `91${cleanedPhone}`,
        type: 'template',
        template: {
          name: 'hello_world',
          language: {
            code: 'en_US'
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("\n✅ Dispatch Success!");
    console.log("Response Data:", JSON.stringify(response.data, null, 2));
  } catch (err: any) {
    console.error("\n❌ Meta WhatsApp API Dispatch Failed:", err.response?.data || err.message);
  }
}

testHelloWorldMessage().catch((err) => {
  console.error("❌ Test Script failed with error:", err);
});
