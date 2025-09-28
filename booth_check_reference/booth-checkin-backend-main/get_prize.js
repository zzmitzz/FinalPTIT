const axios = require('axios')

// This is a simple script to get the prize ID for the lucky wheel test
const BASE_URL = 'http://localhost:3456'
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiQVVUSE9SSVpBVElPTiIsImRhdGEiOnsib3JnYW5pemVyX2lkIjoiNjdkMDk1NWQ3YWJhZWY0MjgyYjE1NWQ1In0sImlhdCI6MTc0Mzc5NTA3MiwiZXhwIjoxNzQ0Mzk5ODcyfQ.GlkubQ6-3RuO3c__LHjoUNVPhO8b48fXBxvmGslXoo0'
const EVENT_ID = '67e16ea8b46e98d2d68bf370' // Workshop TEST event ID

async function getPrizeId() {
    try {
        const response = await axios.get(`${BASE_URL}/events/${EVENT_ID}/lucky-wheel-prizes`, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        })

        console.log('Prize response:', JSON.stringify(response.data, null, 2))

        if (response.data && Array.isArray(response.data)) {
            const prizes = response.data
            if (prizes.length > 0) {
                console.log('\n🏆 Available Prizes:')
                prizes.forEach((prize, i) => {
                    console.log(`${i + 1}. ID: ${prize._id}, Name: ${prize.name}`)
                })

                console.log('\n✅ Use this config in test_lucky_wheel.js:')
                console.log(`  prizeId: '${prizes[0]._id}',`)
            } else {
                console.log('❌ No prizes found')
            }
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            const prizes = response.data.data
            if (prizes.length > 0) {
                console.log('\n🏆 Available Prizes:')
                prizes.forEach((prize, i) => {
                    console.log(`${i + 1}. ID: ${prize._id}, Name: ${prize.name}`)
                })

                console.log('\n✅ Use this config in test_lucky_wheel.js:')
                console.log(`  prizeId: '${prizes[0]._id}',`)
            } else {
                console.log('❌ No prizes found')
            }
        } else {
            console.log('❌ Unexpected response format')
        }
    } catch (error) {
        console.error('Error fetching prizes:', error.message)
        if (error.response) {
            console.error('Status:', error.response.status)
            console.error('Data:', error.response.data)
        }
    }
}

getPrizeId() 