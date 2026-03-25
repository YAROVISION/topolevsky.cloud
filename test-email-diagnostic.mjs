import 'dotenv/config';
import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Adding debug logging
    debug: true,
    logger: true,
  });

  console.log('--- SMTP Config ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('Admin Email:', process.env.ADMIN_EMAIL);
  console.log('-------------------');

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"Test Debug" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: 'Debug Email Test',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<b>This is a test email to verify SMTP configuration.</b>',
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ SMTP Error:', err);
  } finally {
    process.exit(0);
  }
}

testEmail();
