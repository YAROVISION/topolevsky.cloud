const nodemailer = require('nodemailer')
require('dotenv').config({ path: '.env.local' })

async function main() {
	console.log('Testing SMTP with:')
	console.log('Host:', process.env.SMTP_HOST)
	console.log('Port:', process.env.SMTP_PORT)
	console.log('User:', process.env.SMTP_USER)

	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT),
		secure: Number(process.env.SMTP_PORT) === 465,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS
		}
	})

	try {
		await transporter.verify()
		console.log('SMTP connection successful!')
	} catch (error) {
		console.error('SMTP connection failed:', error)
	}
}

main()
