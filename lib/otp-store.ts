// In-memory OTP storage for demo
// In production, use Redis or database

interface OTPData {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPData>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, code: string): void {
  otpStore.set(phone, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  });
}

export function verifyOTP(phone: string, code: string): { valid: boolean; message: string } {
  const data = otpStore.get(phone);

  if (!data) {
    return { valid: false, message: "Code expiré ou non trouvé" };
  }

  if (Date.now() > data.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: "Code expiré" };
  }

  if (data.attempts >= 3) {
    otpStore.delete(phone);
    return { valid: false, message: "Trop de tentatives. Demandez un nouveau code" };
  }

  if (data.code !== code) {
    data.attempts++;
    return { valid: false, message: "Code incorrect" };
  }

  // Success - remove from store
  otpStore.delete(phone);
  return { valid: true, message: "Code vérifié" };
}

export function clearOTP(phone: string): void {
  otpStore.delete(phone);
}

