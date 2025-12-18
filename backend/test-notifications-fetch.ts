import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testNotificationsFetch() {
  console.log('🧪 Testing Notifications Fetch\n');

  // You'll need to replace this with a real JWT token from a logged-in user
  const token = process.argv[2];

  if (!token) {
    console.error('❌ Please provide a JWT token as argument');
    console.log('Usage: npx ts-node test-notifications-fetch.ts <JWT_TOKEN>');
    process.exit(1);
  }

  try {
    console.log('1️⃣ Fetching notifications...');
    const response = await axios.get(`${API_URL}/notifications?limit=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Response:', JSON.stringify(response.data, null, 2));
    console.log(`\n📊 Total notifications: ${response.data.total}`);
    console.log(`📋 Returned: ${response.data.notifications.length}`);

    if (response.data.notifications.length > 0) {
      console.log('\n📬 Sample notification:');
      console.log(JSON.stringify(response.data.notifications[0], null, 2));
    }

    console.log('\n2️⃣ Fetching unread count...');
    const countResponse = await axios.get(`${API_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Unread count:', countResponse.data.count);

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testNotificationsFetch();
