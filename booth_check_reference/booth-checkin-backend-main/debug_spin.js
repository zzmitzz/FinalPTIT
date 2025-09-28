const axios = require('axios')

// Configuration - use the wheel and prize we already created in setup_successful_spin.js
const CONFIG = {
    baseUrl: 'http://localhost:3456',
    eventId: '67e16ea8b46e98d2d68bf370', // Workshop TEST event ID
    organizerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0',
    registrationId: '67e171a9b46e98d2d68bfd71', // Checked-in registration ID
    // Use the most recent wheel and prize IDs from the previous run
    wheelId: '67f03835b6deee5701146400',
    prizeId: '67f03835b6deee57011463f9'
}

// Helper function to create axios instance with auth headers
const api = axios.create({
    baseURL: CONFIG.baseUrl,
    headers: {
        'Authorization': `Bearer ${CONFIG.organizerToken}`,
        'Content-Type': 'application/json',
    },
})

// Debug function
async function debugSpin() {
    try {
        console.log('🔍 DEBUGGING LUCKY WHEEL SPIN ISSUE 🔍')
        console.log('--------------------------------------')

        // Step 1: Check if the wheel exists
        console.log('1. Checking if wheel exists...')
        try {
            const wheelResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel/${CONFIG.wheelId}`)
            console.log('Wheel exists:', JSON.stringify(wheelResponse.data, null, 2))
        } catch (error) {
            console.error('Wheel not found:', error.response?.data || error.message)
            return
        }

        // Step 2: Check if prize exists and is available
        console.log('\n2. Checking prize...')
        try {
            const prizesResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel-prizes`)

            let prizeFound = false
            if (prizesResponse.data && prizesResponse.data.data) {
                const prize = prizesResponse.data.data.find(p => p._id === CONFIG.prizeId)
                if (prize) {
                    prizeFound = true
                    console.log('Prize details:', {
                        id: prize._id,
                        name: prize.name,
                        available: prize.availability
                    })

                    // If prize is not available, update it
                    if (!prize.availability) {
                        console.log('Prize not available! Updating...')
                        await api.put(`/events/${CONFIG.eventId}/lucky-wheel-prizes/${CONFIG.prizeId}`, {
                            name: prize.name,
                            availability: true,
                            event_id: CONFIG.eventId
                        })
                        console.log('Prize updated to be available')
                    }
                }
            }

            if (!prizeFound) {
                console.error('Prize not found in the list')
                return
            }
        } catch (error) {
            console.error('Error checking prize:', error.response?.data || error.message)
            return
        }

        // Step 3: Check wheel-prize association
        console.log('\n3. Checking wheel-prize association...')
        try {
            const wheelPrizesResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel/${CONFIG.wheelId}/prizes`)
            console.log('Wheel prizes:', JSON.stringify(wheelPrizesResponse.data, null, 2))

            // If no prizes associated or wrong quantity, fix it
            if (!wheelPrizesResponse.data?.data?.prizes ||
                wheelPrizesResponse.data.data.prizes.length === 0 ||
                wheelPrizesResponse.data.data.prizes[0].remaining_quantity <= 0) {

                console.log('Setting up prizes for the wheel again...')
                await api.post(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CONFIG.wheelId}/prizes`,
                    {
                        prizes: [
                            {
                                prize_id: CONFIG.prizeId,
                                quantity: 10 // Set a high quantity
                            }
                        ]
                    }
                )
                console.log('Prizes re-associated with wheel')
            }
        } catch (error) {
            console.error('Error checking wheel-prize association:', error.response?.data || error.message)
            return
        }

        // Step 4: Check registration
        console.log('\n4. Checking registration...')
        try {
            const regResponse = await api.get(`/events/${CONFIG.eventId}/registrations/${CONFIG.registrationId}`)
            console.log('Registration exists:', !!regResponse.data)
            console.log('Checked in?', !!regResponse.data?.data?.check_in_at)
        } catch (error) {
            console.error('Error checking registration:', error.response?.data || error.message)
            // Continue anyway
        }

        // Step 5: Try spin with explicit debug info
        console.log('\n5. Attempting spin with detailed logging...')
        try {
            const spinResponse = await api.post(
                `/events/${CONFIG.eventId}/lucky-wheel/${CONFIG.wheelId}/spin`,
                { registration_id: CONFIG.registrationId }
            )
            console.log('Spin response:', JSON.stringify(spinResponse.data, null, 2))

            if (spinResponse.data?.data?.success === false) {
                console.log('\n⚠️ Still getting no available prizes response!')
                console.log('Possible issues:')
                console.log('1. Prize is not properly associated with the wheel')
                console.log('2. Prize quantities are not being tracked correctly')
                console.log('3. There could be an issue with the spinLuckyWheel service function')
            } else {
                console.log('\n🎉 Success! Prize was awarded.')
            }
        } catch (error) {
            console.error('Spin failed:', error.response?.data || error.message)
        }

        console.log('\n--------------------------------------')
        console.log('🔍 DEBUG COMPLETE 🔍')

    } catch (error) {
        console.error('Debug error:', error)
    }
}

// Run debug
debugSpin() 