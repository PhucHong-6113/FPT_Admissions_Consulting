// Test script to validate authentication setup
// Run this in browser console after logging in

async function testRequestTicketAuth() {
    const SERVICE_URLS = {
        RequestTicketService: 'http://localhost:5052'
    };
    
    const accessToken = localStorage.getItem('access_token');
    console.log('Access Token:', accessToken ? 'Present' : 'Missing');
    
    if (!accessToken) {
        console.error('❌ No access token found. Please login first.');
        return;
    }
    
    const tests = [
        {
            name: 'Health Check (No Auth)',
            url: `${SERVICE_URLS.RequestTicketService}/health`,
            needsAuth: false
        },
        {
            name: 'My Tickets',
            url: `${SERVICE_URLS.RequestTicketService}/api/request-tickets/my-tickets`,
            needsAuth: true
        },
        {
            name: 'All Tickets',
            url: `${SERVICE_URLS.RequestTicketService}/api/request-tickets`,
            needsAuth: true
        },
        {
            name: 'Pending Tickets',
            url: `${SERVICE_URLS.RequestTicketService}/api/request-tickets/pending`,
            needsAuth: true
        }
    ];
    
    console.log('🔧 Testing Request Ticket Service Authentication...\n');
    
    for (const test of tests) {
        try {
            const headers = {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            };
            
            if (test.needsAuth) {
                headers['Authorization'] = `Bearer ${accessToken}`;
            }
            
            console.log(`Testing ${test.name}...`);
            const response = await fetch(test.url, {
                method: 'GET',
                headers
            });
            
            const statusIcon = response.ok ? '✅' : '❌';
            console.log(`${statusIcon} ${test.name}: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.log(`   Error details: ${errorText.substring(0, 200)}...`);
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: Network Error - ${error.message}`);
        }
    }
    
    console.log('\n🏁 Authentication test completed!');
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
    console.log('🚀 Request Ticket Authentication Test Ready!');
    console.log('📝 Run: testRequestTicketAuth()');
    // Uncomment to auto-run: testRequestTicketAuth();
}
