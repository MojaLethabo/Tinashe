async function resendSend(payload: {
  from: string
  to: string
  replyTo?: string
  subject: string
  html: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})
}

// ── Contact form ──────────────────────────────────────────────────────────────

export interface ContactEmailOpts {
  name: string
  email: string
  subject: string
  message: string
}

export async function sendContactEmail(opts: ContactEmailOpts): Promise<void> {
  const to        = process.env.CONTACT_TO_EMAIL ?? 'muteroinnocent@gmail.com'
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'notifications@zard.co.za'
  const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  const html = `
    <div style="font-family:sans-serif;max-width:600px;color:#222">
      <h2 style="font-size:1.1rem;margin-bottom:0.25rem">New message from ${opts.name}</h2>
      <p style="color:#888;font-size:0.8rem;margin-bottom:1.5rem">
        Via the contact form at <a href="${siteUrl}/contact" style="color:#555">${siteUrl}/contact</a>
      </p>

      <table style="width:100%;border-collapse:collapse;margin-bottom:1.5rem">
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-size:0.75rem;color:#666;width:90px;text-transform:uppercase;letter-spacing:0.08em">Name</td>
            <td style="padding:8px 12px;font-size:0.875rem">${opts.name}</td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-size:0.75rem;color:#666;text-transform:uppercase;letter-spacing:0.08em">Email</td>
            <td style="padding:8px 12px;font-size:0.875rem"><a href="mailto:${opts.email}" style="color:#333">${opts.email}</a></td></tr>
        <tr><td style="padding:8px 12px;background:#f5f5f5;font-size:0.75rem;color:#666;text-transform:uppercase;letter-spacing:0.08em">Subject</td>
            <td style="padding:8px 12px;font-size:0.875rem">${opts.subject}</td></tr>
      </table>

      <div style="border-left:3px solid #ddd;padding:1rem 1.25rem;background:#fafafa;font-size:0.9rem;line-height:1.7;color:#333">
        ${opts.message.replace(/\n/g, '<br>')}
      </div>

      <p style="margin-top:1.5rem;font-size:0.75rem;color:#aaa">
        Reply directly to this email to respond to ${opts.name}.
      </p>
    </div>
  `

  await resendSend({
    from: `ZARD Contact <${fromEmail}>`,
    to,
    replyTo: opts.email,
    subject: `[ZARD Contact] ${opts.subject}`,
    html,
  })
}

// ── Comment notifications ─────────────────────────────────────────────────────

interface CommentNotifyOpts {
  targetType: 'blog' | 'episode'
  targetId: string
  name: string
  comment: string
  parentId?: string
}

export async function notifyNewComment(opts: CommentNotifyOpts): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL
  const fromEmail  = process.env.RESEND_FROM_EMAIL ?? 'notifications@zard.co.za'
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  if (!adminEmail) return

  const isReply     = Boolean(opts.parentId)
  const subject     = isReply ? `New reply from ${opts.name}` : `New comment from ${opts.name}`
  const targetLabel = opts.targetType === 'blog' ? `Blog post: ${opts.targetId}` : `Episode: ${opts.targetId}`

  const html = `
    <div style="font-family:sans-serif;max-width:560px;color:#222">
      <h2 style="font-size:1.1rem;margin-bottom:0.5rem">${subject}</h2>
      <p style="color:#666;font-size:0.875rem;margin-bottom:1.5rem">${targetLabel}</p>
      <blockquote style="border-left:3px solid #ddd;margin:0;padding:0.75rem 1rem;background:#f9f9f9;color:#333;font-size:0.9rem">
        ${opts.comment.replace(/\n/g, '<br>')}
      </blockquote>
      <p style="margin-top:1.5rem">
        <a href="${siteUrl}/admin/comments" style="background:#111;color:#fff;padding:0.5rem 1.25rem;text-decoration:none;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase">
          View in Admin
        </a>
      </p>
    </div>
  `

  await resendSend({ from: `ZARD Notifications <${fromEmail}>`, to: adminEmail, subject, html })
}
