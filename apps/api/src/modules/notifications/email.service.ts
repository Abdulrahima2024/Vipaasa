
/**
 * Sends an email via the Resend HTTP API using native fetch.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const replyTo = process.env.EMAIL_REPLY_TO || process.env.SUPPORT_EMAIL || "support@vipaasaorganics.com";

  if (!apiKey) {
    console.warn(`\n[WARN] RESEND_API_KEY is not set. Email to ${to} was NOT sent.`);
    console.warn(`Subject: ${subject}`);
    console.warn(`-------------------------\n`);
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        reply_to: replyTo,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      console.error("[ERROR] Resend API failed:", data);
      return false;
    }

    console.log(`[INFO] Email successfully sent to ${to} (ID: ${data.id})`);
    return true;
  } catch (error) {
    console.error("[ERROR] Failed to send email via Resend:", error);
    return false;
  }
}

/**
 * Generates the HTML template for OTP emails.
 */
export function getOtpEmailTemplate(otp: string, purpose: "verification" | "reset") {
  const title = purpose === "verification" ? "Verify Your Account" : "Reset Your Password";
  const headline = purpose === "verification" ? "Welcome to Vipaasa Organics" : "Password Reset Request";
  const description = purpose === "verification"
    ? "Thank you for joining our organic community. Please verify your email address to complete your registration and unlock your organic wellness journey."
    : "We received a request to reset the password for your Vipaasa Organics account. Use the verification code below to proceed.";
  
  const footerText = purpose === "verification"
    ? "If you did not sign up for this account, you can safely ignore this email."
    : "If you did not request a password reset, please secure your account immediately or contact support.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F9F7F2;
      color: #1F3E2F;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F9F7F2;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #EAE6DB;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .header {
      background-color: #113C27;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px 35px;
    }
    .content h2 {
      color: #113C27;
      font-size: 22px;
      margin-top: 0;
      margin-bottom: 15px;
      font-weight: 600;
    }
    .content p {
      font-size: 15px;
      line-height: 1.6;
      color: #5C6E61;
      margin-bottom: 30px;
    }
    .code-container {
      background-color: #FAF9F5;
      border: 1px dashed #113C27;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    .code-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #113C27;
      margin-bottom: 8px;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #113C27;
      font-family: monospace;
      margin: 0;
    }
    .expiry {
      font-size: 12px;
      color: #A84444;
      font-weight: 600;
      margin-top: 5px;
    }
    .divider {
      height: 1px;
      background-color: #EAE6DB;
      margin: 30px 0;
    }
    .footer {
      background-color: #FAF9F5;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #EAE6DB;
    }
    .footer p {
      font-size: 12px;
      color: #738276;
      line-height: 1.5;
      margin: 0 0 10px 0;
    }
    .footer a {
      color: #113C27;
      text-decoration: underline;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Vipaasa Organics</h1>
      </div>
      <div class="content">
        <h2>${headline}</h2>
        <p>${description}</p>
        
        <div class="code-container">
          <div class="code-label">Your Verification Code</div>
          <div class="code">${otp}</div>
          <div class="expiry">Expires in 10 minutes</div>
        </div>
        
        <p style="font-size: 13px; color: #738276; margin-bottom: 0;">
          ${footerText}
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2026 Vipaasa Organics. Artisanal. Ethical. Pure.</p>
        <p>
          Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@vipaasaorganics.com'}">${process.env.SUPPORT_EMAIL || 'support@vipaasaorganics.com'}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
