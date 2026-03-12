import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Use nodemailer if available and SMTP env vars are configured.
let nodemailer: any = null
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	nodemailer = require('nodemailer')
} catch (err) {
	// nodemailer not installed — we'll return informative error when needed
	nodemailer = null
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const { name, email, subject, message } = body || {}
		if (!name || !email || !subject || !message) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
		}

		const ADMIN_EMAIL =
			process.env.ADMIN_EMAIL ||
			process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
			'yarovision@gmail.com'

		const smtpHost = process.env.SMTP_HOST
		const smtpPort = process.env.SMTP_PORT
		const smtpUser = process.env.SMTP_USER
		const smtpPass = process.env.SMTP_PASS

		let transporter: any = null

		if (nodemailer && smtpHost && smtpPort && smtpUser && smtpPass) {
			transporter = nodemailer.createTransport({
				host: smtpHost,
				port: Number(smtpPort),
				secure: Number(smtpPort) === 465,
				auth: { user: smtpUser, pass: smtpPass }
			})
		} else if (nodemailer) {
			// Fallback to Ethereal test account for local development/testing
			const testAccount = await nodemailer.createTestAccount()
			transporter = nodemailer.createTransport({
				host: testAccount.smtp.host,
				port: testAccount.smtp.port,
				secure: testAccount.smtp.secure,
				auth: { user: testAccount.user, pass: testAccount.pass }
			})
		} else {
			return NextResponse.json(
				{
					error:
						'Email sending not configured on server. Install nodemailer and set SMTP_* env vars.'
				},
				{ status: 501 }
			)
		}

		const mail = {
			from: `"${name}" <${smtpUser}>`, // Send from authorized SMTP user
			replyTo: email, // Set user's email as reply-to
			to: ADMIN_EMAIL,
			subject: `[Контакти] ${subject}`,
			text: `Надіслано з форми контакти

Ім'я: ${name}
Email: ${email}
Тема: ${subject}

Повідомлення:
${message}
`,
			html: `<p>Надіслано з форми контакти</p><p><strong>Ім'я:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Тема:</strong> ${subject}</p><p><strong>Повідомлення:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`
		}

		const info = await transporter.sendMail(mail)

		// If using Ethereal test account, return preview URL for convenience
		let previewUrl = null
		try {
			// nodemailer provides a helper for Ethereal preview
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const anyN = nodemailer as any
			previewUrl = anyN.getTestMessageUrl ? anyN.getTestMessageUrl(info) : null
		} catch (e) {
			previewUrl = null
		}

		return NextResponse.json({ message: 'Повідомлення надіслано.', previewUrl })
	} catch (err: any) {
		console.error('Contact form error:', err)
		// keep error message generic for security
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
