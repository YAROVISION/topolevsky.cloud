import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const email = process.argv[2]

if (!email) {
  console.error('❌ Будь ласка, вкажіть email: node scripts/set-admin.mjs user@example.com')
  process.exit(1)
}

const dbConfig = {
  host: process.env.USERS_DB_HOST || '127.0.0.1',
  user: process.env.USERS_DB_USER,
  password: process.env.USERS_DB_PASSWORD || process.env.USERS_DB_PASS,
  database: process.env.USERS_DB_NAME,
  port: Number(process.env.USERS_DB_PORT || 3307),
}

async function setAdmin() {
  let connection
  try {
    console.log(`🔌 Підключення до БД: ${dbConfig.host}:${dbConfig.port}...`)
    connection = await mysql.createConnection(dbConfig)

    const [result] = await connection.execute(
      'UPDATE users SET role = "ADMIN" WHERE email = ?',
      [email]
    )

    if (result.affectedRows > 0) {
      console.log(`✅ Успіх! Користувач ${email} тепер має роль ADMIN.`)
    } else {
      console.log(`⚠️ Користувача з email ${email} не знайдено в базі даних.`)
      
      const [users] = await connection.execute(
        'SELECT email FROM users ORDER BY createdAt DESC LIMIT 5'
      )
      
      if (users.length > 0) {
        console.log('\nОстанні користувачі в базі:')
        users.forEach(u => console.log(` - ${u.email}`))
      } else {
        console.log('\nБаза даних користувачів порожня. Спробуйте спочатку зареєструватись на сайті.')
      }
    }
  } catch (error) {
    console.error('❌ Помилка:', error.message)
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Підказка: Переконайтеся, що SSH-тунель запущено (npm run dev)')
    }
  } finally {
    if (connection) await connection.end()
  }
}

setAdmin()
