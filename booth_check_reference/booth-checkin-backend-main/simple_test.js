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

async function simpleTest() {
    try {
        console.log('🧪 SIMPLE LUCKY WHEEL TEST 🧪')
        console.log('----------------------------')

        // Step 1: Get existing registrations
        console.log('1. Finding existing registrations...')
        let registrationId
        try {
            // Try to get a checked-in registration
            const response = await api.get(`/events/${CONFIG.eventId}/registrations?status=CHECKED_IN`)

            if (response.data && response.data.data && response.data.data.length > 0) {
                // Use the first checked-in registration
                registrationId = response.data.data[0]._id
                console.log(`Using checked-in registration: ${registrationId}`)
            } else {
                // Get any registration
                const allRegsResponse = await api.get(`/events/${CONFIG.eventId}/registrations`)

                if (allRegsResponse.data && allRegsResponse.data.data && allRegsResponse.data.data.length > 0) {
                    registrationId = allRegsResponse.data.data[0]._id
                    console.log(`Using non-checked-in registration: ${registrationId}`)

                    // Try to check in this registration
                    console.log('Attempting to check in this registration...')
                    try {
                        await api.post(`/events/${CONFIG.eventId}/registrations/${registrationId}/check-in`, {
                            check_in_method: 'QR_CODE'
                        })
                        console.log('Registration checked in successfully')
                    } catch (checkInError) {
                        console.log('Could not check in registration:', checkInError.response?.data || checkInError.message)
                    }
                } else {
                    console.log('No registrations found. Using fallback ID.')
                    registrationId = '67e171a9b46e98d2d68bfd71' // Fallback ID from previous tests
                }
            }
        } catch (error) {
            console.error('Error getting registrations:', error.response?.data || error.message)
            registrationId = '67e171a9b46e98d2d68bfd71' // Fallback ID
        }

        // Step 2: Create a prize
        console.log('\n2. Creating prize...')
        let prizeId
        try {
            const prizeResponse = await api.post(`/events/${CONFIG.eventId}/upload-prizes`, {
                name: `Test Prize ${Date.now()}`,
                picture: '',
                event_id: CONFIG.eventId,
                availability: true
            })

            console.log('Prize created')

            // Get the prize ID by listing prizes
            const prizesResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel-prizes`)
            if (prizesResponse.data && prizesResponse.data.data) {
                // Find our prize (most recent one)
                const latestPrize = prizesResponse.data.data[0]
                prizeId = latestPrize._id
                console.log(`Using prize ID: ${prizeId}`)
            } else {
                throw new Error('Could not find created prize')
            }
        } catch (error) {
            console.error('Error with prize:', error.response?.data || error.message)
            return
        }

        // Step 3: Create LUCKY_PRIZE wheel
        console.log('\n3. Creating lucky wheel...')
        let wheelId
        try {
            const wheelResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
                title: `Test Wheel ${Date.now()}`,
                type: 'LUCKY_PRIZE'
            })

            wheelId = wheelResponse.data.data._id
            console.log(`Created wheel with ID: ${wheelId}`)

            // Associate prize with wheel
            await api.post(`/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/prizes`, {
                prizes: [{ prize_id: prizeId, quantity: 10 }]
            })
            console.log('Prize associated with wheel')
        } catch (error) {
            console.error('Error creating wheel:', error.response?.data || error.message)
            return
        }

        // Step 4: Display registration details
        console.log('\n4. Getting registration details...')
        try {
            const regResponse = await api.get(`/events/${CONFIG.eventId}/registrations/${registrationId}`)
            console.log('Registration details:', JSON.stringify(regResponse.data, null, 2))
        } catch (error) {
            console.log('Could not get registration details:', error.response?.data || error.message)
        }

        // Step 5: Try to spin the wheel
        console.log('\n5. Spinning the wheel...')
        try {
            const spinResponse = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/spin`,
                { registration_id: registrationId }
            )

            console.log('Spin response:', JSON.stringify(spinResponse.data, null, 2))

            if (spinResponse.data?.data?.success === false) {
                console.log('\n⚠️ Spin failed with message: ' + spinResponse.data.data.message)
            } else {
                console.log('\n🎉 Spin successful!')
            }
        } catch (error) {
            console.error('Error spinning wheel:', error.response?.data || error.message)
        }

        // Step 6: Get wheel history
        console.log('\n6. Checking wheel history...')
        try {
            const historyResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel/${wheelId}/history`)
            console.log('History:', JSON.stringify(historyResponse.data, null, 2))
        } catch (error) {
            console.error('Error getting history:', error.response?.data || error.message)
        }

        // Summary
        console.log('\n----------------------------')
        console.log('TEST DATA:')
        console.log(`Event ID: ${CONFIG.eventId}`)
        console.log(`Registration ID: ${registrationId}`)
        console.log(`Prize ID: ${prizeId}`)
        console.log(`Wheel ID: ${wheelId}`)
        console.log('----------------------------')

    } catch (error) {
        console.error('Unexpected error:', error)
    }
}

simpleTest() 