const axios = require('axios')

// Configuration
const CONFIG = {
    baseUrl: 'http://localhost:3456',
    eventId: '67e16ea8b46e98d2d68bf370', // Workshop TEST event ID
    organizerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0',
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
async function setupSuccessfulSpin() {
    try {
        console.log('🎯 SETTING UP SUCCESSFUL LUCKY WHEEL SPIN 🎯')
        console.log('-------------------------------------------')

        // Step 1: Create a new prize with availability=true
        console.log('1. Creating a new prize...')
        const prizeResponse = await api.post(`/events/${CONFIG.eventId}/upload-prizes`, {
            name: 'Special Test Prize',
            picture: '',
            event_id: CONFIG.eventId,
            availability: true
        })

        console.log('Prize response:', JSON.stringify(prizeResponse.data, null, 2))

        // Get the prize ID - we need to fetch prizes after creating
        console.log('\nFetching prizes to find our new prize...')
        const prizesListResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel-prizes`)
        console.log('Prizes list response:', JSON.stringify(prizesListResponse.data, null, 2))

        // Find the prize we just created (most recent one with our name)
        let prizeId
        if (prizesListResponse.data && Array.isArray(prizesListResponse.data)) {
            const specialPrize = prizesListResponse.data.find(p => p.name === 'Special Test Prize')
            prizeId = specialPrize?._id
        } else if (prizesListResponse.data && prizesListResponse.data.data && Array.isArray(prizesListResponse.data.data)) {
            const specialPrize = prizesListResponse.data.data.find(p => p.name === 'Special Test Prize')
            prizeId = specialPrize?._id
        }

        if (!prizeId) {
            throw new Error('Could not find the newly created prize')
        }

        console.log(`Using prize with ID: ${prizeId}`)

        // Step 2: Create a new lucky wheel
        console.log('\n2. Creating a new lucky wheel...')
        const wheelResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
            title: 'Special Test Wheel',
            type: 'LUCKY_PRIZE'
        })

        const wheelId = wheelResponse.data.data._id
        console.log(`Created lucky wheel with ID: ${wheelId}`)

        // Step 3: Associate the prize with the wheel
        console.log('\n3. Setting up prizes for the wheel...')
        await api.post(
            `/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/prizes`,
            {
                prizes: [
                    {
                        prize_id: prizeId,
                        quantity: 10 // Set a high quantity to ensure availability
                    }
                ]
            }
        )
        console.log('Prize associated with wheel successfully')

        // Step 4: Verify the wheel has prizes
        console.log('\n4. Verifying wheel prizes...')
        const prizesResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/prizes`)
        console.log('Prizes response:', JSON.stringify(prizesResponse.data, null, 2))

        // Step 5: Spin the wheel with registration ID
        console.log('\n5. Spinning the wheel...')
        try {
            const spinResponse = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/spin`,
                { registration_id: CONFIG.registrationId }
            )
            console.log('🎉 SUCCESS! Wheel spin successful:')
            console.log(JSON.stringify(spinResponse.data, null, 2))
        } catch (error) {
            console.log('❌ Wheel spin failed:')
            console.error('Error:', error.response?.data || error.message)
        }

        // Step 6: Check history to confirm
        console.log('\n6. Checking spin history...')
        const historyResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/history`)
        console.log('History response:', JSON.stringify(historyResponse.data, null, 2))

        console.log('\n-------------------------------------------')
        console.log('🎉 SETUP AND TEST COMPLETED 🎉')

    } catch (error) {
        console.error('Setup error:', error.response?.data || error.message)
    }
}

// Run setup
setupSuccessfulSpin() 