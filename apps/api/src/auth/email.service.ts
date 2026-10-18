import nodemailer from 'nodemailer'

type EmailInput = { to: string; subject: string; text: string; html?: string }

export const sendPlatformEmail = async (email: EmailInput) => {
  const provider = process.env.MAIL_PROVIDER ?? 'mailhog'
  if (provider === 'resend') {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY ?? ''}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? 'noreply@sportlens.local', ...email }),
    })
    if (!response.ok) throw new Error('Email provider rejected the message')
    return
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  })
  await transporter.sendMail({ from: process.env.EMAIL_FROM ?? 'noreply@sportlens.local', ...email })
}
