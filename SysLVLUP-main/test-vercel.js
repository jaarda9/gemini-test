const https = require('https');

const BASE_URL = 'https://gemini-test-steel.vercel.app';

async function testEndpoint(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}`;
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Vercel API Endpoints\n');

  try {
    // Test debug endpoint
    console.log('1. Testing debug endpoint...');
    const debugResult = await testEndpoint('/api/debug');
    console.log(`   Status: ${debugResult.status}`);
    console.log(`   Response:`, debugResult.data);
    console.log('');

    // Test registration endpoint
    console.log('2. Testing registration endpoint...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'testpass123'
    };
    const registerResult = await testEndpoint('/api/auth/register', 'POST', registerData);
    console.log(`   Status: ${registerResult.status}`);
    console.log(`   Response:`, registerResult.data);
    console.log('');

    // Test username check endpoint
    console.log('3. Testing username check endpoint...');
    const checkResult = await testEndpoint('/api/auth/check-username?username=testuser');
    console.log(`   Status: ${checkResult.status}`);
    console.log(`   Response:`, checkResult.data);
    console.log('');

    console.log('✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
