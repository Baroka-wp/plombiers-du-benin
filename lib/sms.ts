import AfricasTalking from "africastalking";

// Initialize Africa's Talking
const credentials = {
  apiKey: process.env.AFRICASTALKING_API_KEY || "",
  username: process.env.AFRICASTALKING_USERNAME || "sandbox",
};

const africastalking = AfricasTalking(credentials);
const sms = africastalking.SMS;

export interface SendSMSParams {
  to: string;
  message: string;
  from?: string;
}

export async function sendSMS({ to, message, from }: SendSMSParams) {
  try {
    const options = {
      to: [to],
      message,
      ...(from && { from }),
    };

    const response = await sms.send(options);
    
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("SMS sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

// Helper function to format phone number for Benin (+229)
export function formatBeninPhoneNumber(phone: string): string {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  // If it starts with +229, return as is
  if (cleaned.startsWith("+229")) {
    return cleaned;
  }
  
  // If it starts with 229, add +
  if (cleaned.startsWith("229")) {
    return "+" + cleaned;
  }
  
  // Otherwise, add +229
  return "+229" + cleaned;
}

