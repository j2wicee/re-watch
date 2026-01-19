/**
 * Simple endpoint tester script
 * Run with: node test-endpoints.js
 * 
 * This will test all your backend endpoints to ensure they're working.
 */

const API_BASE_URL = "http://localhost:5000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, method, url, body = null) {
  try {
    log(`\n🧪 Testing ${name}...`, "blue");
    
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    
    if (response.ok) {
      log(`✅ ${name} - SUCCESS`, "green");
      console.log("   Response:", JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      log(`❌ ${name} - FAILED (${response.status})`, "red");
      console.log("   Error:", data.error || "Unknown error");
      return { success: false, data };
    }
  } catch (error) {
    log(`❌ ${name} - ERROR`, "red");
    console.log("   Error:", error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("=".repeat(50), "blue");
  log("Backend Endpoint Tester", "blue");
  log("=".repeat(50), "blue");
  
  // Test 1: Health check
  await testEndpoint("Health Check", "GET", `${API_BASE_URL}/`);
  
  // Test 2: Signup
  const signupResult = await testEndpoint(
    "Signup",
    "POST",
    `${API_BASE_URL}/signup`,
    { email: `test${Date.now()}@example.com`, password: "test123" }
  );
  
  let userId = null;
  if (signupResult.success && signupResult.data.user) {
    userId = signupResult.data.user.id;
    log(`\n📝 Created test user with ID: ${userId}`, "yellow");
  }
  
  // Test 3: Login (use same credentials)
  if (signupResult.success && signupResult.data.user) {
    await testEndpoint(
      "Login",
      "POST",
      `${API_BASE_URL}/login`,
      { email: signupResult.data.user.email, password: "test123" }
    );
  }
  
  // Test 4: Get Watchlist (if we have a userId)
  if (userId) {
    await testEndpoint("Get Watchlist", "GET", `${API_BASE_URL}/watchlist/${userId}`);
    
    // Test 5: Update Watchlist
    await testEndpoint(
      "Update Watchlist",
      "POST",
      `${API_BASE_URL}/watchlist/${userId}`,
      {
        watchlist: [
          {
            id: 1,
            title: "Test Anime",
            year: "2024",
            poster: "https://example.com/poster.jpg",
          },
        ],
      }
    );
    
    // Test 6: Get Watchlist again (should have the item)
    await testEndpoint("Get Watchlist (after update)", "GET", `${API_BASE_URL}/watchlist/${userId}`);
  }
  
  // Test 7: Error cases
  log("\n🧪 Testing error cases...", "blue");
  await testEndpoint("Signup (duplicate email)", "POST", `${API_BASE_URL}/signup`, {
    email: signupResult.data?.user?.email || "test@example.com",
    password: "test123",
  });
  
  await testEndpoint("Login (wrong password)", "POST", `${API_BASE_URL}/login`, {
    email: signupResult.data?.user?.email || "test@example.com",
    password: "wrongpassword",
  });
  
  log("\n" + "=".repeat(50), "blue");
  log("Testing complete!", "green");
  log("=".repeat(50), "blue");
}

// Check if fetch is available (Node 18+)
if (typeof fetch === "undefined") {
  log("❌ This script requires Node.js 18+ (for native fetch)", "red");
  log("   Or install node-fetch: npm install node-fetch", "yellow");
  process.exit(1);
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Test runner failed: ${error.message}`, "red");
  process.exit(1);
});

