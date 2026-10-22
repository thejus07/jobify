import { NextRequest, NextResponse } from "next/server";
import { validateEmailForRole } from "@/lib/email-validator";
import { generateOtp, saveOtpForEmail } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, role, companyName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Role-specific domain validation
    const validation = validateEmailForRole(cleanEmail, role || "CANDIDATE", companyName);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 3. Generate and register 6-digit OTP
    const otp = generateOtp(6);
    saveOtpForEmail(cleanEmail, otp);

    // 4. Send email directly to the recipient's inbox
    const mailResult = await sendOtpEmail({
      toEmail: cleanEmail,
      otp,
      role: role === "RECRUITER" ? "RECRUITER" : "CANDIDATE",
      companyName,
    });

    const isLiveDelivery = mailResult.success && mailResult.provider !== "simulation";

    if (!mailResult.success) {
      return NextResponse.json(
        { error: mailResult.error || "Failed to dispatch verification email. Please check your email address or try again." },
        { status: 500 }
      );
    }

    if (!isLiveDelivery) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Email delivery service not configured. Please add SMTP credentials in server settings." },
          { status: 503 }
        );
      }
      console.log(`\n🔑 [LOCAL DEV OTP for ${cleanEmail}]: ${otp}\n`);
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox and spam folder.`,
      companyDomain: validation.domain,
      mailDelivered: isLiveDelivery,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to dispatch verification code";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
