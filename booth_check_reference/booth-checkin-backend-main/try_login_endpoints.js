const axios = require('axios')

// Configuration
const BASE_URL = 'http://localhost:3456'
const credentials = {
    email: 'admin@gmail.com',
    password: 'password@123'
}

// Possible login endpoints to try
const LOGIN_ENDPOINTS = [
    '/organizer/auth/login',
    '/auth/login',
    '/organizer/login',
    '/api/auth/login',
    '/api/organizer/login',
    '/login'
]

async function tryLoginEndpoints() {
    console.log('Attempting to login with provided credentials...')
    console.log('Trying multiple possible login endpoints...')

    for (const endpoint of LOGIN_ENDPOINTS) {
        try {
            console.log(`\nTrying endpoint: ${endpoint}`)
            const response = await axios.post(`${BASE_URL}${endpoint}`, credentials)
            console.log(response.data)
            if (response.data.data.access_token) {
                console.log('✅ SUCCESS! Found working endpoint:', endpoint)
                console.log('\nYour authentication token is:')
                console.log('-----------------------------------------------------')
                console.log(response.data.data.access_token)
                console.log('-----------------------------------------------------')
                console.log('\nTo update test_lucky_wheel.js with this token:')
                console.log('const CONFIG = {')
                console.log('  baseUrl: \'http://localhost:3456\',')
                console.log('  eventId: \'YOUR_EVENT_ID\', // Replace with a valid event ID')
                console.log(`  organizerToken: '${response.data.data.access_token}',`)
                console.log('  prizeId: \'YOUR_PRIZE_ID\', // Replace with a valid prize ID')
                console.log('};')

                // For shell script
                console.log('\nFor test_lucky_wheel.sh:')
                console.log('ORGANIZER_TOKEN="' + response.data.data.access_token + '"')

                return
            } else {
                console.log('❌ Response received but no token found')
            }
        } catch (error) {
            if (error.response) {
                console.log(`❌ Failed with status: ${error.response.status}`)
            } else {
                console.log('❌ Failed:', error.message)
            }
        }
    }

    console.log('\n❌ All endpoints failed. Possible issues:')
    console.log('1. The server uses a different login endpoint not in our list')
    console.log('2. The credentials provided are incorrect')
    console.log('3. The server may require additional information in the login request')

    // Try to list API endpoints
    console.log('\nLet\'s try to get a list of available endpoints from the server...')
    try {
        const response = await axios.get(`${BASE_URL}`)
        console.log('Server response:', response.data)
    } catch (error) {
        console.log('Could not get endpoints list:', error.message)
    }
}

// Run the function
tryLoginEndpoints() 