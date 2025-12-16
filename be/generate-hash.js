const bcrypt = require('bcrypt')

const password = 'Admin@123'
const saltRounds = 10

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err)
        process.exit(1)
    }
    console.log('Password:', password)
    console.log('Bcrypt Hash:', hash)
    console.log('\nSQL Update Query:')
    console.log(
        `UPDATE system_users SET password = '${hash}', updated_at = NOW() WHERE email IN ('superadmin@ptit.com', 'admin@ptit.com');`
    )
})
