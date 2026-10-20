// Email domain validator for Jobify accounts

export const DISALLOWED_FREE_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "zoho.com",
  "proton.me",
  "protonmail.com",
  "fastmail.com",
  "tutanota.com",
  "yandex.com",
  "rediffmail.com",
]);

export interface EmailValidationResult {
  isValid: boolean;
  isCompanyEmail: boolean;
  domain?: string;
  error?: string;
}

export function validateEmailForRole(
  email: string,
  role: "CANDIDATE" | "RECRUITER",
  companyName?: string
): EmailValidationResult {
  const cleanEmail = email.toLowerCase().trim();

  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      isCompanyEmail: false,
      error: "Please enter a valid email address.",
    };
  }

  const parts = cleanEmail.split("@");
  if (parts.length !== 2) {
    return {
      isValid: false,
      isCompanyEmail: false,
      error: "Invalid email format.",
    };
  }

  const domain = parts[1].toLowerCase();

  // If candidate/jobseeker: all valid domains allowed (gmail, yahoo, .edu, etc.)
  if (role === "CANDIDATE") {
    return {
      isValid: true,
      isCompanyEmail: !DISALLOWED_FREE_DOMAINS.has(domain),
      domain,
    };
  }

  // If recruiter/job poster: MUST be a company domain, NOT free webmail
  if (DISALLOWED_FREE_DOMAINS.has(domain)) {
    const exampleCompany = companyName ? companyName.toLowerCase().replace(/[^a-z0-9]/g, "") : "company";
    return {
      isValid: false,
      isCompanyEmail: false,
      domain,
      error: `Job posters must use their official company email address (e.g. name@${exampleCompany || "company"}.com). Personal webmail addresses like @${domain} are not permitted for employer accounts.`,
    };
  }

  return {
    isValid: true,
    isCompanyEmail: true,
    domain,
  };
}
