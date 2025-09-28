const axios = require('axios')

// Configuration
const BASE_URL = 'http://localhost:3456'
const LOGIN_ENDPOINT = '/auth/organizer/login'

// Credentials provided by the user
const credentials = {
    email: 'admin@gmail.com',
    password: 'password@123'
}

async function getAuthToken() {
    try {
        console.log('Attempting to login with provided credentials...')

        const response = await axios.post(`${BASE_URL}${LOGIN_ENDPOINT}`, credentials)

        if (response.data && response.data.token) {
            console.log('\n✅ Authentication successful!')
            console.log('\nYour authentication token is:')
            console.log('-----------------------------------------------------')
            console.log(response.data.token)
            console.log('-----------------------------------------------------')
            console.log('\nUpdate your test scripts with this token value in the ORGANIZER_TOKEN variable.')
            console.log('For example, in test_lucky_wheel.js:')
            console.log('const CONFIG = {')
            console.log('  ...')
            console.log(`  organizerToken: '${response.data.token}',`)
            console.log('  ...')
            console.log('};')

            return response.data.token
        } else {
            console.log('❌ Authentication response did not contain a token.')
            console.log('Response:', response.data)
        }
    } catch (error) {
        console.error('❌ Authentication failed:')
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error(`Status: ${error.response.status}`)
            console.error('Response:', error.response.data)

            // Check if the login endpoint might be different
            console.log('\nThe login endpoint might be different. Try these alternatives:')
            console.log('1. /auth/login')
            console.log('2. /organizer/login')
            console.log('3. /api/auth/login')
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from server. Check if the server is running.')
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message)
        }
    }
}

// Run the function
getAuthToken() 