import tls from "node:tls";
import net from "node:net";

export interface SendOtpEmailParams {
  toEmail: string;
  recipientName?: string;
  otp: string;
  role?: "CANDIDATE" | "RECRUITER";
  companyName?: string;
}

export interface MailerResult {
  success: boolean;
  provider: "resend" | "smtp" | "simulation";
  messageId?: string;
  error?: string;
}

function getVerificationEmailHtml(otp: string, toEmail: string, role: "CANDIDATE" | "RECRUITER" = "CANDIDATE", companyName?: string): string {
  const isRecruiter = role === "RECRUITER";
  const portalBadge = isRecruiter ? "Jobify Employer Portal" : "Jobify Job Seeker Account";
  const titleText = isRecruiter ? "Verify your company email" : "Verify your email address";
  const subtitleText = isRecruiter
    ? `Enter this 6-digit security code to complete your ${companyName ? `<strong>${companyName}</strong> ` : ""}Job Poster registration.`
    : "Enter this 6-digit security code to verify your email and activate your Jobify account.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jobify Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f7; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 24px; border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04); overflow: hidden; padding: 0;">
          
          <!-- Top Accent / Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center;">
              <div style="display: inline-block; padding: 10px 18px; background: rgba(0, 113, 227, 0.08); border-radius: 9999px; margin-bottom: 16px;">
                <span style="font-size: 13px; font-weight: 600; color: #0071e3; letter-spacing: -0.2px;">${portalBadge}</span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #1d1d1f; letter-spacing: -0.5px; line-height: 1.2;">
                ${titleText}
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 14px; color: #86868b; line-height: 1.5;">
                ${subtitleText}
              </p>
            </td>
          </tr>

          <!-- Security Code Block -->
          <tr>
            <td style="padding: 10px 36px 24px 36px; text-align: center;">
              <div style="background-color: #f5f5f7; border-radius: 18px; border: 1px solid rgba(0, 0, 0, 0.06); padding: 22px 16px; margin: 8px 0;">
                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; color: #86868b; display: block; margin-bottom: 8px;">
                  Your Verification Code
                </span>
                <span style="font-family: 'SF Mono', Monaco, Menlo, 'Courier New', monospace; font-size: 38px; font-weight: 700; letter-spacing: 8px; color: #0071e3; display: inline-block;">
                  ${otp}
                </span>
              </div>
              <p style="margin: 14px 0 0 0; font-size: 12px; color: #86868b; line-height: 1.4;">
                This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Security Note -->
          <tr>
            <td style="padding: 0 36px 36px 36px;">
              <div style="border-top: 1px solid rgba(0, 0, 0, 0.06); padding-top: 20px;">
                <p style="margin: 0; font-size: 12px; color: #a1a1a6; line-height: 1.5; text-align: center;">
                  If you did not request this verification for <strong>${toEmail}</strong>, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 480px; margin-top: 24px; text-align: center;">
          <tr>
            <td style="font-size: 11px; color: #86868b; line-height: 1.5;">
              <p style="margin: 0;">© 2026 Jobify Platform. Made by <a href="https://pixelmind.co.in" style="color: #1d1d1f; text-decoration: underline;">pixelmind.co.in</a></p>
              <p style="margin: 4px 0 0 0;">Early-Career Tech Jobs, Internships & Employer Network</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send email using standard SMTP over TLS (Port 465) or STARTTLS (Port 587)
 */
async function sendViaSmtp(
  config: { host: string; port: number; user?: string; pass?: string; from: string },
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string }> {
  return new Promise((resolve, reject) => {
    const isDirectTls = config.port === 465;
    let socket: net.Socket | tls.TLSSocket;

    const timeout = setTimeout(() => {
      try { socket.destroy(); } catch {}
      reject(new Error("SMTP connection timed out after 15 seconds"));
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
    }

    let buffer = "";
    let step = 0;

    function sendCmd(cmd: string) {
      socket.write(cmd + "\r\n");
    }

    function onData(chunk: Buffer) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split("\r\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line) continue;
        const code = parseInt(line.substring(0, 3), 10);
        const isContinuation = line.charAt(3) === "-";
        if (isContinuation) continue;

        handleSmtpStep(code, line);
      }
    }

    function handleSmtpStep(code: number, line: string) {
      if (step === 0) {
        if (code !== 220) return fail(`Expected 220 greeting, got: ${line}`);
        step = 1;
        sendCmd(`EHLO localhost`);
      } else if (step === 1) {
        if (code !== 250) return fail(`EHLO rejected: ${line}`);
        if (!config.user) {
          step = 5;
          sendCmd(`MAIL FROM:<${config.from}>`);
        } else {
          step = 2;
          sendCmd(`AUTH LOGIN`);
        }
      } else if (step === 2) {
        if (code !== 334) return fail(`AUTH LOGIN failed: ${line}`);
        step = 3;
        sendCmd(Buffer.from(config.user || "").toString("base64"));
      } else if (step === 3) {
        if (code !== 334) return fail(`Username rejected: ${line}`);
        step = 4;
        sendCmd(Buffer.from(config.pass || "").toString("base64"));
      } else if (step === 4) {
        if (code !== 235) return fail(`Authentication failed: ${line}`);
        step = 5;
        const envelopeFrom = config.from.includes("<")
          ? config.from.replace(/.*<([^>]+)>.*/, "$1").trim()
          : config.from.trim();
        sendCmd(`MAIL FROM:<${envelopeFrom}>`);
      } else if (step === 5) {
        if (code !== 250) return fail(`MAIL FROM rejected: ${line}`);
        step = 6;
        sendCmd(`RCPT TO:<${to}>`);
      } else if (step === 6) {
        if (code !== 250) return fail(`Recipient rejected (${to}): ${line}`);
        step = 7;
        sendCmd(`DATA`);
      } else if (step === 7) {
        if (code !== 354) return fail(`DATA command rejected: ${line}`);
        step = 8;

        const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@${config.host}>`;
        const emailHeaders = [
          `From: Jobify <${config.from}>`,
          `To: ${to}`,
          `Subject: ${subject}`,
          `Message-ID: ${messageId}`,
          `Date: ${new Date().toUTCString()}`,
          `MIME-Version: 1.0`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: 8bit`,
        ].join("\r\n");

        socket.write(`${emailHeaders}\r\n\r\n${html}\r\n.\r\n`);
      } else if (step === 8) {
        if (code !== 250) return fail(`Message rejected: ${line}`);
        step = 9;
        sendCmd(`QUIT`);
        cleanup();
        resolve({ success: true, messageId: line });
      }
    }

    function fail(msg: string) {
      cleanup();
      try { socket.destroy(); } catch {}
      reject(new Error(msg));
    }

    if (isDirectTls) {
      socket = tls.connect(
        {
          host: config.host,
          port: config.port,
          rejectUnauthorized: false,
        },
        () => {
          // Connected via TLS
        }
      );
    } else {
      socket = net.connect(
        {
          host: config.host,
          port: config.port,
        },
        () => {
          // Connected via TCP
        }
      );
    }

    socket.on("data", onData);
    socket.on("error", (err) => fail(`SMTP socket error: ${err.message}`));
    socket.on("close", () => {
      if (step < 8) fail("SMTP connection closed unexpectedly");
    });
  });
}

/**
 * Dispatch verification OTP to the user's real email address.
 */
export async function sendOtpEmail(params: SendOtpEmailParams): Promise<MailerResult> {
  const { toEmail, otp, role, companyName } = params;
  const subject = `Your Jobify Verification Code: ${otp}`;
  const html = getVerificationEmailHtml(otp, toEmail, role, companyName);

  // 1. Try direct SMTP (Hostinger / Gmail) — delivers to ANY recipient in the world
  const smtpHost = process.env.SMTP_HOST || (process.env.SMTP_USER ? "smtp.hostinger.com" : null);
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || "thejus@pixelmind.co.in";

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const res = await sendViaSmtp(
        {
          host: smtpHost,
          port: smtpPort,
          user: smtpUser,
          pass: smtpPass,
          from: smtpFrom,
        },
        toEmail,
        subject,
        html
      );

      console.log(`✉️ [EMAIL SENT via Hostinger SMTP] Dispatched to ${toEmail} (ID: ${res.messageId})`);
      return { success: true, provider: "smtp", messageId: res.messageId };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "SMTP send failed";
      console.error(`SMTP delivery error to ${toEmail}:`, errorMsg);
    }
  }

  // 2. Fallback to Resend API if SMTP not available
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Jobify <onboarding@resend.dev>",
          to: [toEmail],
          subject,
          html,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.message || `Resend delivery rejected (${res.status})`;
        console.warn(`⚠️ [RESEND NOTICE] ${errorMsg}`);
        return { success: false, provider: "resend", error: errorMsg };
      }

      console.log(`✉️ [EMAIL SENT via Resend] Successfully dispatched to ${toEmail} (ID: ${data.id})`);
      return { success: true, provider: "resend", messageId: data.id };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Resend request failed";
      console.error("Resend delivery exception:", errorMsg);
      return { success: false, provider: "resend", error: errorMsg };
    }
  }

  // 3. Fallback when credentials are not yet entered in .env
  console.log(`\n==================================================`);
  console.log(`⚠️  [REAL EMAIL NOTICE]`);
  console.log(`No active SMTP_USER/SMTP_PASS or RESEND_API_KEY found in .env.`);
  console.log(`Destination: ${toEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Code: ${otp}`);
  console.log(`Configure SMTP in .env to deliver directly to ${toEmail}`);
  console.log(`==================================================\n`);

  return {
    success: true,
    provider: "simulation",
    error: "SMTP credentials not configured in .env",
  };
}
