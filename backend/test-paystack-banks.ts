/**
 * Test script to verify Paystack banks API
 * Run with: npx ts-node test-paystack-banks.ts
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

async function testPaystackBanks() {
  console.log('🧪 Testing Paystack Banks API...\n');

  if (!PAYSTACK_SECRET_KEY) {
    console.error('❌ PAYSTACK_SECRET_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ Paystack secret key found');
  console.log(`   Key: ${PAYSTACK_SECRET_KEY.substring(0, 15)}...`);
  console.log('');

  try {
    console.log('📡 Making request to Paystack...');
    console.log('   URL: https://api.paystack.co/bank');
    console.log('   Params: { country: "nigeria", perPage: 100 }');
    console.log('');

    const response = await axios.get('https://api.paystack.co/bank', {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      params: {
        country: 'nigeria',
        perPage: 100,
      },
      timeout: 30000,
    });

    console.log('✅ Request successful!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Status Text: ${response.statusText}`);
    console.log('');

    const banks = response.data.data;
    console.log(`🏦 Banks received: ${banks.length}`);
    console.log('');

    if (banks.length > 0) {
      console.log('📋 First 10 banks:');
      banks.slice(0, 10).forEach((bank: any, index: number) => {
        console.log(`   ${index + 1}. ${bank.name} (${bank.code})`);
      });
      console.log('');
    }

    console.log('✅ Paystack banks API is working correctly!');
    console.log('');
    console.log('📊 Full response structure:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error: any) {
    console.error('❌ Error testing Paystack API:');
    console.error('');

    if (error.response) {
      console.error('   Response Error:');
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Status Text: ${error.response.statusText}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('   Request Error (no response received):');
      console.error(`   ${error.message}`);
    } else {
      console.error('   Error:');
      console.error(`   ${error.message}`);
    }

    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   1. Check your internet connection');
    console.error('   2. Verify PAYSTACK_SECRET_KEY is correct');
    console.error('   3. Ensure Paystack API is not down');
    console.error('   4. Check if your IP is blocked by Paystack');

    process.exit(1);
  }
}

// Run the test
testPaystackBanks();
