import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSessionToken } from "@/lib/auth";
import { validateEmailForRole } from "@/lib/email-validator";
import { verifyOtpForEmail } from "@/lib/otp";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, otp, companyName } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const userRole = role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";

    // 1. Role-specific domain validation
    const validation = validateEmailForRole(cleanEmail, userRole, companyName);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 2. Email Verification Requirement (Required for both Job Seeker & Job Poster)
    if (!otp || typeof otp !== "string" || otp.trim().length === 0) {
      return NextResponse.json(
        { error: "A 6-digit verification code (OTP) is required to complete registration." },
        { status: 400 }
      );
    }

    const otpResult = verifyOtpForEmail(cleanEmail, otp);
    if (!otpResult.success) {
      return NextResponse.json({ error: otpResult.error }, { status: 400 });
    }

    // 3. Check for existing account
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 4. Create User Record
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        role: userRole,
        headline: userRole === "RECRUITER" && companyName ? `Recruiter / Talent Lead at ${companyName}` : undefined,
      },
    });

    // 5. If recruiter and companyName provided, ensure company exists
    if (userRole === "RECRUITER" && companyName) {
      const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      try {
        await prisma.company.upsert({
          where: { slug: companySlug },
          create: {
            slug: companySlug,
            name: companyName.trim(),
            website: validation.domain ? `https://${validation.domain}` : undefined,
            isVerified: true,
          },
          update: {},
        });
      } catch {
        // Non-critical if company already exists
      }
    }

    // 6. Sign Session Token & Set Cookie
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const res = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    res.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
