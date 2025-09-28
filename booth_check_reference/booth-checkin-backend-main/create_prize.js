const axios = require('axios')

// This script creates a test prize for an event to use in lucky wheel tests

// Configuration (update these values from your login and find_resources.js results)
const BASE_URL = 'http://localhost:3456'
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0' // Replace with your auth token
const EVENT_ID = '67e16ea8b46e98d2d68bf370' // Workshop TEST event ID

// API instance with auth header
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
})

async function createTestPrize() {
    if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN' || EVENT_ID === 'YOUR_EVENT_ID') {
        console.error('⚠️ Please update the AUTH_TOKEN and EVENT_ID with actual values')
        console.error('Run the try_login_endpoints.js and find_resources.js scripts first')
        return
    }

    console.log('Creating test prize for lucky wheel...')

    const prizeData = {
        name: 'Test Lucky Wheel Prize',
        availability: true,
        event_id: EVENT_ID
    }

    try {
        const response = await api.post(`/events/${EVENT_ID}/upload-prizes`, prizeData)

        console.log('✅ Prize created successfully!')
        console.log('Response:', response.data)

        // Try to fetch the newly created prize
        console.log('\nFetching prizes to confirm...')
        const prizesResponse = await api.get(`/events/${EVENT_ID}/lucky-wheel-prizes`)

        if (prizesResponse.data && Array.isArray(prizesResponse.data)) {
            const prizes = prizesResponse.data
            console.log(`Found ${prizes.length} prizes:`)

            prizes.forEach((prize, index) => {
                console.log(`\nPrize ${index + 1}:`)
                console.log(`ID: ${prize._id}`)
                console.log(`Name: ${prize.name}`)
                console.log(`Available: ${prize.availability}`)
            })

            // Find our test prize
            const testPrize = prizes.find(p => p.name === prizeData.name)
            if (testPrize) {
                console.log(`\n🎯 Use this prize ID for testing: ${testPrize._id}`)

                // Update test scripts
                console.log('\nFor test_lucky_wheel.js:')
                console.log(`  prizeId: '${testPrize._id}',`)

                console.log('\nFor test_lucky_wheel.sh:')
                console.log(`LW_PRIZE_ID="${testPrize._id}"`)
            }
        }
    } catch (error) {
        console.error('❌ Error creating prize:')
        if (error.response) {
            console.error(`Status: ${error.response.status}`)
            console.error('Response:', error.response.data)
        } else {
            console.error(error.message)
        }
    }
}

createTestPrize() 