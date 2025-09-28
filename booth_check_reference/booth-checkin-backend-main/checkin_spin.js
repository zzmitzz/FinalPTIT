const axios = require('axios')

// Configuration
const CONFIG = {
    baseUrl: 'http://localhost:3456',
    eventId: '67e16ea8b46e98d2d68bf370', // Workshop TEST event ID
    organizerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0',
}

// Helper function to create axios instance with auth headers
const api = axios.create({
    baseURL: CONFIG.baseUrl,
    headers: {
        'Authorization': `Bearer ${CONFIG.organizerToken}`,
        'Content-Type': 'application/json',
    },
})

async function testCheckedInSpin() {
    try {
        console.log('🎯 TESTING LUCKY_CHECKED_IN WHEEL SPIN 🎯')
        console.log('----------------------------------------')

        // Step 1: Create a new prize
        console.log('1. Creating a new prize...')
        const prizeResponse = await api.post(`/events/${CONFIG.eventId}/upload-prizes`, {
            name: 'Checked-In Test Prize',
            picture: '',
            event_id: CONFIG.eventId,
            availability: true
        })
        console.log('Prize created successfully')

        // Get the prize ID
        console.log('\nFetching prizes to find our new prize...')
        const prizesListResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel-prizes`)

        // Find the prize we just created
        let prizeId
        if (prizesListResponse.data && prizesListResponse.data.data) {
            const checkedInPrize = prizesListResponse.data.data.find(p => p.name === 'Checked-In Test Prize')
            prizeId = checkedInPrize?._id
        }

        if (!prizeId) {
            throw new Error('Could not find the newly created prize')
        }

        console.log(`Using prize with ID: ${prizeId}`)

        // Step 2: Create a LUCKY_CHECKED_IN wheel
        console.log('\n2. Creating a LUCKY_CHECKED_IN wheel...')
        const wheelResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
            title: 'Checked-In Test Wheel',
            type: 'LUCKY_CHECKED_IN'
        })

        const wheelId = wheelResponse.data.data._id
        console.log(`Created LUCKY_CHECKED_IN wheel with ID: ${wheelId}`)

        // Step 3: Associate the prize with the wheel
        console.log('\n3. Setting up prizes for the wheel...')
        await api.post(
            `/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/prizes`,
            {
                prizes: [
                    {
                        prize_id: prizeId,
                        quantity: 10
                    }
                ]
            }
        )
        console.log('Prize associated with wheel successfully')

        // Step 4: Get all registrations to check if any are checked-in
        console.log('\n4. Checking for checked-in registrations...')
        try {
            const registrationsResponse = await api.get(`/events/${CONFIG.eventId}/registrations?status=CHECKED_IN`)
            console.log('Registrations:', JSON.stringify(registrationsResponse.data, null, 2))

            const checkedInCount = registrationsResponse.data?.data?.length || 0
            console.log(`Found ${checkedInCount} checked-in registrations`)

            if (checkedInCount === 0) {
                console.log('\n⚠️ No checked-in registrations found. The spin will likely fail.')
                console.log('To fix this, you need to check in at least one registration in your event.')
            }
        } catch (error) {
            console.error('Error getting registrations:', error.response?.data || error.message)
        }

        // Step 5: Spin the wheel (no registration_id needed for LUCKY_CHECKED_IN)
        console.log('\n5. Spinning the LUCKY_CHECKED_IN wheel...')
        try {
            const spinResponse = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/spin`,
                {} // Empty payload - LUCKY_CHECKED_IN doesn't need registration_id
            )
            console.log('Spin response:', JSON.stringify(spinResponse.data, null, 2))

            if (spinResponse.data?.data?.success === false) {
                console.log('\n⚠️ The spin failed with: ' + spinResponse.data.data.message)
                console.log('Likely cause: No checked-in registrations available')
            } else {
                console.log('\n🎉 Success! A checked-in registration was selected and awarded a prize.')
            }
        } catch (error) {
            console.error('Spin failed:', error.response?.data || error.message)
        }

        console.log('\n----------------------------------------')
        console.log('🎯 TEST COMPLETED 🎯')

    } catch (error) {
        console.error('Test error:', error.response?.data || error.message)
    }
}

// Run test
testCheckedInSpin() 