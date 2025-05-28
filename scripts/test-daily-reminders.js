// Simple script to test the daily reminders API endpoint
import fetch from 'node-fetch';

// Generate a random secret key for testing if one isn't provided
const testSecretKey = process.env.TEST_CRON_SECRET || 'test-secret-key-' + Math.random().toString(36).substring(2, 15);

// Update your .env.local file with this secret key if needed
console.log('Using test secret key:', testSecretKey);
console.log('Make sure to add this to your .env.local file as CRON_SECRET_KEY');

async function testDailyReminders() {
  try {
    console.log('Testing daily reminders API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/cron/daily-reminders', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testSecretKey}`
      }
    });
    
    const data = await response.json();
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('Error:', data.error);
      if (data.error === 'Unauthorized') {
        console.log('Make sure your CRON_SECRET_KEY in .env.local matches the one used in this request');
      }
    } else {
      console.log('Test successful!');
      if (data.emailsSent === 0) {
        console.log('No emails were sent. This could be because:');
        console.log('1. There are no overdue tasks in your database');
        console.log('2. Tasks don\'t have valid email addresses');
        console.log('3. All overdue tasks are already marked as completed');
      } else {
        console.log(`${data.emailsSent} email(s) sent to ${data.usersNotified} user(s) for ${data.totalOverdueTasks} overdue task(s)`);
      }
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('Make sure your Next.js development server is running (npm run dev)');
  }
}

testDailyReminders();
