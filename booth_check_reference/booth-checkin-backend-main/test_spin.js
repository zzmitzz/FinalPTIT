const axios = require('axios')

// Configuration
const CONFIG = {
    baseUrl: 'http://localhost:3456',
    eventId: '67e16ea8b46e98d2d68bf370', // Workshop TEST event ID
    organizerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0',
    prizeId: '67f034b972dfeb2eeab68d6f', // Prize ID found
    registrationId: '67e171a9b46e98d2d68bfd71', // Checked-in registration ID
}

// Helper function to create axios instance with auth headers
const api = axios.create({
    baseURL: CONFIG.baseUrl,
    headers: {
        'Authorization': `Bearer ${CONFIG.organizerToken}`,
        'Content-Type': 'application/json',
    },
})

// Test function
async function testSpin() {
    try {
        console.log('🎯 TESTING LUCKY WHEEL SPIN API 🎯')
        console.log('----------------------------------')

        // Step 1: Create test wheels
        console.log('1. Creating test lucky wheels...')

        // Create LUCKY_PRIZE wheel
        const createPrizeResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
            title: 'Debug Test Wheel - Prize Only',
            type: 'LUCKY_PRIZE',
        })

        const prizeWheelId = createPrizeResponse.data.data._id
        console.log(`Created LUCKY_PRIZE wheel with ID: ${prizeWheelId}`)

        // Create LUCKY_CHECKED_IN wheel
        const createCheckedInResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
            title: 'Debug Test Wheel - Checked In',
            type: 'LUCKY_CHECKED_IN',
        })

        const checkedInWheelId = createCheckedInResponse.data.data._id
        console.log(`Created LUCKY_CHECKED_IN wheel with ID: ${checkedInWheelId}`)

        // Step 2: Set up prizes for the LUCKY_PRIZE wheel
        console.log('\n2. Setting up prizes for LUCKY_PRIZE wheel...')
        await api.post(
            `/events/${CONFIG.eventId}/lucky-wheel/${prizeWheelId}/prizes`,
            {
                prizes: [
                    {
                        prize_id: CONFIG.prizeId,
                        quantity: 10,
                    },
                ],
            }
        )
        console.log('Prizes set successfully')

        // Step 3: Attempt to spin the LUCKY_PRIZE wheel with different payload formats
        console.log('\n3. Testing LUCKY_PRIZE wheel spin with different formats...')

        // Test format 1: Just registration_id
        try {
            console.log('\nTest 1: Simple registration_id')
            const spinData1 = { registration_id: CONFIG.registrationId }
            console.log('Request payload:', JSON.stringify(spinData1, null, 2))

            const response1 = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${prizeWheelId}/spin`,
                spinData1
            )
            console.log('✅ Success!')
            console.log('Response:', JSON.stringify(response1.data, null, 2))
        } catch (error) {
            console.log('❌ Failed')
            console.error('Error:', error.response?.data || error.message)
        }

        // Test format 2: No payload
        try {
            console.log('\nTest 2: Empty payload')
            const spinData2 = {}
            console.log('Request payload:', JSON.stringify(spinData2, null, 2))

            const response2 = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${prizeWheelId}/spin`,
                spinData2
            )
            console.log('✅ Success!')
            console.log('Response:', JSON.stringify(response2.data, null, 2))
        } catch (error) {
            console.log('❌ Failed')
            console.error('Error:', error.response?.data || error.message)
        }

        // Step 4: Attempt to spin the LUCKY_CHECKED_IN wheel
        console.log('\n4. Testing LUCKY_CHECKED_IN wheel spin...')

        // Test LUCKY_CHECKED_IN: Empty payload
        try {
            console.log('\nTest for LUCKY_CHECKED_IN: Empty payload')
            const spinData = {}
            console.log('Request payload:', JSON.stringify(spinData, null, 2))

            const response = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${checkedInWheelId}/spin`,
                spinData
            )
            console.log('✅ Success!')
            console.log('Response:', JSON.stringify(response.data, null, 2))
        } catch (error) {
            console.log('❌ Failed')
            console.error('Error:', error.response?.data || error.message)
        }

        // Step 5: Clean up (delete wheels)
        console.log('\n5. Cleaning up...')
        await api.delete(`/events/${CONFIG.eventId}/lucky-wheel/${prizeWheelId}`)
        await api.delete(`/events/${CONFIG.eventId}/lucky-wheel/${checkedInWheelId}`)
        console.log('Test wheels deleted')

        console.log('\n----------------------------------')
        console.log('🎉 SPIN TESTING COMPLETED 🎉')

    } catch (error) {
        console.error('Test error:', error)
    }
}

// Run tests
testSpin() 