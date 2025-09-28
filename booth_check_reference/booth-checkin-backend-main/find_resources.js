const axios = require('axios')

// This script helps find existing event IDs and prize IDs to use in the lucky wheel tests
// It requires a valid auth token

// Configuration (update this with your token)
const BASE_URL = 'http://localhost:3456'
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0'

// API instance with auth header
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
})

async function findResources() {
    if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN') {
        console.error('⚠️ Please update the AUTH_TOKEN with your actual token')
        console.error('Run the try_login_endpoints.js script first to get a token')
        return
    }

    console.log('🔍 Finding resources for Lucky Wheel tests...')

    try {
        // Step 1: Get all events
        console.log('\n📋 Fetching events...')
        const eventsResponse = await api.get('/events')

        // Log the entire response structure to debug
        console.log('Response structure:', JSON.stringify(eventsResponse.data, null, 2))

        if (!eventsResponse.data || !eventsResponse.data.data) {
            console.log('❌ Could not find events in the expected response format')
            return
        }

        const eventsData = eventsResponse.data.data
        let events = []

        // Handle different response structures
        if (Array.isArray(eventsData)) {
            events = eventsData
        } else if (eventsData.items && Array.isArray(eventsData.items)) {
            events = eventsData.items
        } else {
            console.log('❌ Could not find events array in the response')
            return
        }

        console.log(`✅ Found ${events.length} events`)

        if (events.length === 0) {
            console.log('❌ No events found. Please create an event first.')
            return
        }

        // Display events
        events.forEach((event, index) => {
            console.log(`\n📅 Event ${index + 1}:`)
            console.log(`ID: ${event._id}`)
            console.log(`Name: ${event.name}`)
            console.log(`Status: ${event.status || 'N/A'}`)
        })

        // Use the first event for testing
        const selectedEvent = events[0]
        console.log(`\n🎯 Using event: ${selectedEvent.name} (${selectedEvent._id}) for testing`)

        // Step 2: Get prizes for the selected event
        try {
            console.log('\n🏆 Fetching lucky wheel prizes...')
            const prizesResponse = await api.get(`/events/${selectedEvent._id}/lucky-wheel-prizes`)

            console.log('▶️ PRIZES RESPONSE:', JSON.stringify(prizesResponse.data, null, 2))

            let prizes = []
            if (prizesResponse.data && Array.isArray(prizesResponse.data)) {
                prizes = prizesResponse.data
            } else if (prizesResponse.data && prizesResponse.data.data && Array.isArray(prizesResponse.data.data)) {
                prizes = prizesResponse.data.data
            } else if (prizesResponse.data && prizesResponse.data.status === 200 && prizesResponse.data.data) {
                prizes = prizesResponse.data.data
            } else {
                console.log('❌ No prizes found or unexpected response format')
                console.log('\nYou need to create prizes first using the endpoint:')
                console.log(`POST /events/${selectedEvent._id}/upload-prizes`)
                console.log('\nExample payload:')
                console.log(JSON.stringify({
                    name: 'Test Prize',
                    availability: true
                }, null, 2))
            }

            if (prizes.length > 0) {
                console.log(`✅ Found ${prizes.length} prizes`)

                // Display prizes
                prizes.forEach((prize, index) => {
                    console.log(`\n🎁 Prize ${index + 1}:`)
                    console.log(`ID: ${prize._id}`)
                    console.log(`Name: ${prize.name}`)
                    console.log(`Available: ${prize.availability}`)
                })

                // Use the first prize for testing
                const selectedPrize = prizes[0]
                console.log(`\n🎯 Using prize: ${selectedPrize.name} (${selectedPrize._id}) for testing`)
            } else {
                console.log('❌ No prizes found. Please create prizes first.')
            }
        } catch (error) {
            console.log('❌ Error fetching prizes:', error.message)
            if (error.response) {
                console.log('Response status:', error.response.status)
                console.log('Response data:', error.response.data)
            }
        }

        // Step 3: Try to get registrations
        try {
            console.log('\n👥 Fetching registrations...')
            const registrationsResponse = await api.get(`/events/${selectedEvent._id}/registrations`)

            console.log('Registrations response:', JSON.stringify(registrationsResponse.data, null, 2))

            let registrations = []
            if (registrationsResponse.data && Array.isArray(registrationsResponse.data)) {
                registrations = registrationsResponse.data
            } else if (registrationsResponse.data && registrationsResponse.data.data && Array.isArray(registrationsResponse.data.data)) {
                registrations = registrationsResponse.data.data
            } else if (registrationsResponse.data && registrationsResponse.data.data && registrationsResponse.data.data.items && Array.isArray(registrationsResponse.data.data.items)) {
                registrations = registrationsResponse.data.data.items
            } else {
                console.log('❌ No registrations found or unexpected response format')
                return
            }

            console.log(`✅ Found ${registrations.length} registrations`)

            if (registrations.length === 0) {
                console.log('❌ No registrations found. You may not be able to test LUCKY_CHECKED_IN type fully.')
            } else {
                // Find a checked-in registration if possible
                const checkedInReg = registrations.find(reg => reg.check_in_at)

                if (checkedInReg) {
                    console.log(`\n✅ Found checked-in registration: ${checkedInReg._id}`)
                } else {
                    console.log('\n⚠️ No checked-in registrations found. Using first registration.')
                }

                // Use for testing
                const selectedReg = checkedInReg || registrations[0]
                console.log(`\n🎯 Using registration: ${selectedReg._id} for testing`)
            }
        } catch (error) {
            console.log('❌ Error fetching registrations:', error.message)
            if (error.response) {
                console.log('Response status:', error.response.status)
                console.log('Response data:', error.response.data)
            }
        }

        // Output configuration for test scripts
        const configTemplate = {
            baseUrl: BASE_URL,
            eventId: selectedEvent._id,
            organizerToken: AUTH_TOKEN,
            prizeId: 'REPLACE_WITH_PRIZE_ID_FROM_ABOVE',
            registrationId: 'REPLACE_WITH_REGISTRATION_ID_FROM_ABOVE'
        }

        console.log('\n📝 Configuration template for test_lucky_wheel.js:')
        console.log('const CONFIG = ' + JSON.stringify(configTemplate, null, 2) + ';')

        console.log('\n📝 Configuration for test_lucky_wheel.sh:')
        console.log(`BASE_URL="${BASE_URL}"`)
        console.log(`EVENT_ID="${selectedEvent._id}"`)
        console.log(`ORGANIZER_TOKEN="${AUTH_TOKEN}"`)
        console.log('LW_PRIZE_ID="REPLACE_WITH_PRIZE_ID_FROM_ABOVE"')
        console.log('REGISTRATION_ID="REPLACE_WITH_REGISTRATION_ID_FROM_ABOVE"')

    } catch (error) {
        console.error('❌ Error:', error.message)
        if (error.response) {
            console.error('Status:', error.response.status)
            console.error('Response:', error.response.data)
        }
    }
}

findResources() 