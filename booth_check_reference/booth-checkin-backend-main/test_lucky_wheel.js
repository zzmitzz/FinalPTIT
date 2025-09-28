/**
 * Lucky Wheel API Tests
 * 
 * This script tests the Lucky Wheel API endpoints using the axios library.
 * To run this test:
 * 1. Install axios: npm install axios
 * 2. Update the configuration variables below
 * 3. Run: node test_lucky_wheel.js
 */

const axios = require('axios')

// Configuration (update these values)
const CONFIG = {
    baseUrl: 'http://localhost:3456',
    eventId: '67e16ea8b46e98d2d68bf370', // Workshop TEST event ID
    organizerToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0',
    prizeId: '67f034b972dfeb2eeab68d6f', // Prize ID found
    registrationId: '67e171a9b46e98d2d68bfd71', // Checked-in registration ID
}

// Keep track of created resources
const CREATED = {
    luckyWheelPrizeId: null,
    luckyWheelCheckedInId: null,
}

// Helper function to create axios instance with auth headers
const api = axios.create({
    baseURL: CONFIG.baseUrl,
    headers: {
        'Authorization': `Bearer ${CONFIG.organizerToken}`,
        'Content-Type': 'application/json',
    },
})

// Helper function to log test results
function logTest(name, success, result) {
    console.log(`\n==== TEST: ${name} ====`)
    console.log(`Result: ${success ? '✅ PASSED' : '❌ FAILED'}`)
    if (!success) {
        console.error('Error:', result)
    } else if (result) {
        console.log('Data:', typeof result === 'string' ? result : JSON.stringify(result, null, 2))
    }
}

// Run all tests in sequence
async function runTests() {
    try {
        console.log('🧪 STARTING LUCKY WHEEL API TESTS 🧪')
        console.log('-----------------------------------')

        // Test 1: Create a lucky wheel (LUCKY_PRIZE type)
        try {
            const createPrizeResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
                title: 'Test Lucky Wheel - Prize Only',
                type: 'LUCKY_PRIZE',
            })

            // Log the response to see its structure
            console.log('Create Lucky Wheel Response:', JSON.stringify(createPrizeResponse.data, null, 2))

            // Adjust ID extraction based on response structure
            CREATED.luckyWheelPrizeId = createPrizeResponse.data._id ||
                createPrizeResponse.data.id ||
                (createPrizeResponse.data.data && createPrizeResponse.data.data._id)

            logTest('Create Lucky Wheel (LUCKY_PRIZE)', true, `Created with ID: ${CREATED.luckyWheelPrizeId}`)
        } catch (error) {
            logTest('Create Lucky Wheel (LUCKY_PRIZE)', false, error.response?.data || error.message)
        }

        // Test 2: Create a lucky wheel (LUCKY_CHECKED_IN type)
        try {
            const createCheckedInResponse = await api.post(`/events/${CONFIG.eventId}/lucky-wheel`, {
                title: 'Test Lucky Wheel - Checked In',
                type: 'LUCKY_CHECKED_IN',
            })

            // Log the response to see its structure
            console.log('Create Lucky Wheel (CHECKED_IN) Response:', JSON.stringify(createCheckedInResponse.data, null, 2))

            // Adjust ID extraction based on response structure
            CREATED.luckyWheelCheckedInId = createCheckedInResponse.data._id ||
                createCheckedInResponse.data.id ||
                (createCheckedInResponse.data.data && createCheckedInResponse.data.data._id)

            logTest('Create Lucky Wheel (LUCKY_CHECKED_IN)', true, `Created with ID: ${CREATED.luckyWheelCheckedInId}`)
        } catch (error) {
            logTest('Create Lucky Wheel (LUCKY_CHECKED_IN)', false, error.response?.data || error.message)
        }

        // Test 3: Get all lucky wheels
        try {
            const getAllResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheels`)
            console.log('Get All Lucky Wheels Response:', JSON.stringify(getAllResponse.data, null, 2))

            // Handle different response formats
            const wheels = Array.isArray(getAllResponse.data)
                ? getAllResponse.data
                : (getAllResponse.data.data && Array.isArray(getAllResponse.data.data)
                    ? getAllResponse.data.data
                    : [])

            logTest('Get All Lucky Wheels', true, `Found ${wheels.length} lucky wheels`)

            // Try to get IDs from the list if they weren't captured during creation
            if (!CREATED.luckyWheelPrizeId && wheels.length > 0) {
                const prizeWheel = wheels.find(w => w.type === 'LUCKY_PRIZE')
                if (prizeWheel) {
                    CREATED.luckyWheelPrizeId = prizeWheel._id || prizeWheel.id
                    console.log(`Found prize wheel ID from list: ${CREATED.luckyWheelPrizeId}`)
                }
            }

            if (!CREATED.luckyWheelCheckedInId && wheels.length > 0) {
                const checkedInWheel = wheels.find(w => w.type === 'LUCKY_CHECKED_IN')
                if (checkedInWheel) {
                    CREATED.luckyWheelCheckedInId = checkedInWheel._id || checkedInWheel.id
                    console.log(`Found checked-in wheel ID from list: ${CREATED.luckyWheelCheckedInId}`)
                }
            }
        } catch (error) {
            logTest('Get All Lucky Wheels', false, error.response?.data || error.message)
        }

        // Test 4: Get a specific lucky wheel
        if (CREATED.luckyWheelPrizeId) {
            try {
                const getOneResponse = await api.get(`/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}`)
                logTest('Get Lucky Wheel', true, getOneResponse.data)
            } catch (error) {
                logTest('Get Lucky Wheel', false, error.response?.data || error.message)
            }
        } else {
            logTest('Get Lucky Wheel', false, 'Skipped: No lucky wheel was created')
        }

        // Test 5: Update a lucky wheel
        if (CREATED.luckyWheelPrizeId) {
            try {
                const updateResponse = await api.put(`/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}`, {
                    title: 'Updated Test Wheel',
                    type: 'LUCKY_PRIZE',
                })
                logTest('Update Lucky Wheel', true, updateResponse.data)
            } catch (error) {
                logTest('Update Lucky Wheel', false, error.response?.data || error.message)
            }
        } else {
            logTest('Update Lucky Wheel', false, 'Skipped: No lucky wheel was created')
        }

        // Test 6: Set prizes for a lucky wheel
        if (CREATED.luckyWheelPrizeId) {
            try {
                const setPrizesResponse = await api.post(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}/prizes`,
                    {
                        prizes: [
                            {
                                prize_id: CONFIG.prizeId,
                                quantity: 10,
                            },
                        ],
                    }
                )
                logTest('Set Lucky Wheel Prizes', true, setPrizesResponse.data)
            } catch (error) {
                logTest('Set Lucky Wheel Prizes', false, error.response?.data || error.message)
            }
        } else {
            logTest('Set Lucky Wheel Prizes', false, 'Skipped: No lucky wheel was created')
        }

        // Test 7: Get prizes for a lucky wheel
        if (CREATED.luckyWheelPrizeId) {
            try {
                const getPrizesResponse = await api.get(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}/prizes`
                )
                logTest('Get Lucky Wheel Prizes', true, getPrizesResponse.data)
            } catch (error) {
                logTest('Get Lucky Wheel Prizes', false, error.response?.data || error.message)
            }
        } else {
            logTest('Get Lucky Wheel Prizes', false, 'Skipped: No lucky wheel was created')
        }

        // Test 8: Spin the LUCKY_PRIZE wheel
        if (CREATED.luckyWheelPrizeId) {
            try {
                // Let's try a minimal payload format - there may be different expectations for the API
                console.log('Attempting to spin LUCKY_PRIZE wheel with registration ID')

                // Try with just registration_id
                const spinData = { registration_id: CONFIG.registrationId }

                console.log('Spin request data:', JSON.stringify(spinData, null, 2))

                const spinResponse = await api.post(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}/spin`,
                    spinData
                )
                logTest('Spin Lucky Wheel (LUCKY_PRIZE)', true, spinResponse.data)
            } catch (error) {
                console.error('Spin error response:', JSON.stringify(error.response?.data, null, 2))
                logTest('Spin Lucky Wheel (LUCKY_PRIZE)', false, error.response?.data || error.message)
            }
        } else {
            logTest('Spin Lucky Wheel (LUCKY_PRIZE)', false, 'Skipped: No lucky wheel was created')
        }

        // Test 9: Spin the LUCKY_CHECKED_IN wheel
        if (CREATED.luckyWheelCheckedInId) {
            try {
                // For LUCKY_CHECKED_IN, we don't need to send a registration ID
                // Try with an empty payload
                console.log('Attempting to spin LUCKY_CHECKED_IN wheel with empty payload')

                const spinCheckedInResponse = await api.post(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelCheckedInId}/spin`,
                    {}
                )
                logTest('Spin Lucky Wheel (LUCKY_CHECKED_IN)', true, spinCheckedInResponse.data)
            } catch (error) {
                console.error('Checked-in spin error response:', JSON.stringify(error.response?.data, null, 2))
                logTest('Spin Lucky Wheel (LUCKY_CHECKED_IN)', false, error.response?.data || error.message)
            }
        } else {
            logTest('Spin Lucky Wheel (LUCKY_CHECKED_IN)', false, 'Skipped: No lucky wheel was created')
        }

        // Test 10: Get history of lucky wheel spins
        if (CREATED.luckyWheelPrizeId) {
            try {
                const historyResponse = await api.get(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}/history`
                )
                logTest('Get Lucky Wheel History', true, historyResponse.data)
            } catch (error) {
                logTest('Get Lucky Wheel History', false, error.response?.data || error.message)
            }
        } else {
            logTest('Get Lucky Wheel History', false, 'Skipped: No lucky wheel was created')
        }

        // Test 11: Clean up - Delete the lucky wheels (optional - comment out if you want to keep them)
        if (CREATED.luckyWheelPrizeId) {
            try {
                const deleteResponse = await api.delete(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelPrizeId}`
                )
                logTest('Delete Lucky Wheel (LUCKY_PRIZE)', true, deleteResponse.data)
            } catch (error) {
                logTest('Delete Lucky Wheel (LUCKY_PRIZE)', false, error.response?.data || error.message)
            }
        }

        if (CREATED.luckyWheelCheckedInId) {
            try {
                const deleteCheckedInResponse = await api.delete(
                    `/events/${CONFIG.eventId}/lucky-wheel/${CREATED.luckyWheelCheckedInId}`
                )
                logTest('Delete Lucky Wheel (LUCKY_CHECKED_IN)', true, deleteCheckedInResponse.data)
            } catch (error) {
                logTest('Delete Lucky Wheel (LUCKY_CHECKED_IN)', false, error.response?.data || error.message)
            }
        }

        console.log('\n-----------------------------------')
        console.log('🎉 ALL TESTS COMPLETED 🎉')

    } catch (error) {
        console.error('Test runner error:', error)
    }
}

// Run the tests
runTests() 