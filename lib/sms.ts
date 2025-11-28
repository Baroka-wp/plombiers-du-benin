import axios from 'axios';

// Termii OTP API - Gère génération et vérification côté serveur
const TERMII_URL = 'https://api.ng.termii.com/api/sms/otp';

export interface SendOTPResult {
  success: boolean;
  pinId?: string;
  error?: string;
}

export interface VerifyOTPResult {
  success: boolean;
  error?: string;
}

export const smsService = {
  /**
   * Envoie un code OTP au numéro spécifié
   */
  async sendOTP(phoneNumber: string): Promise<SendOTPResult> {
    try {
      const apiKey = process.env.TERMII_API_KEY;
      const senderId = process.env.TERMII_SENDER_ID || "N-Alert";

      if (!apiKey) {
        return { success: false, error: "TERMII_API_KEY non configurée" };
      }

      // Formatage du numéro pour le Bénin
      const formattedNumber = formatBeninPhoneNumber(phoneNumber);

      const payload = {
        api_key: apiKey,
        message_type: "NUMERIC",
        to: formattedNumber,
        from: senderId,
        channel: "dnd",
        pin_attempts: 3,
        pin_time_to_live: 5, // 5 minutes
        pin_length: 6,
        pin_placeholder: "< 1234 >",
        message_text: "Votre code de verification pour l'Annuaire des Plombiers est < 1234 >. Valide 5 min."
      };

      console.log('Sending OTP to Termii:', { 
        to: formattedNumber, 
        from: senderId,
        url: `${TERMII_URL}/send` 
      });

      const response = await axios.post(`${TERMII_URL}/send`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data.pinId) {
        return { success: true, pinId: response.data.pinId };
      }
      
      throw new Error(response.data.message || "Erreur d'envoi");
    } catch (error) {
      console.error('Erreur SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Server responded with error status
          const errorData = error.response.data;
          const status = error.response.status;
          
          console.error('Termii API Error Response:', {
            status,
            data: errorData,
            statusText: error.response.statusText,
          });

          // Extract error message from Termii response
          let errorMessage = "Impossible d'envoyer le SMS.";
          
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }

          // Provide more specific error messages
          if (status === 400) {
            errorMessage = errorMessage || "Requête invalide. Vérifiez le format du numéro.";
          } else if (status === 401) {
            errorMessage = "Clé API invalide. Vérifiez TERMII_API_KEY.";
          } else if (status === 402) {
            errorMessage = "Crédits insuffisants. Rechargez votre compte Termii.";
          } else if (status === 500) {
            errorMessage = errorMessage || "Erreur serveur Termii. Réessayez plus tard.";
          }

          return { success: false, error: errorMessage };
        } else if (error.request) {
          // Request made but no response
          console.error('No response from Termii API:', error.request);
          return { success: false, error: "Pas de réponse du serveur SMS. Vérifiez votre connexion." };
        }
      }

      // Generic error
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: `Impossible d'envoyer le SMS: ${errorMessage}` };
    }
  },

  /**
   * Vérifie le code saisi par l'utilisateur
   */
  async verifyOTP(pinId: string, code: string): Promise<VerifyOTPResult> {
    try {
      const apiKey = process.env.TERMII_API_KEY;

      if (!apiKey) {
        return { success: false, error: "TERMII_API_KEY non configurée" };
      }

      const payload = {
        api_key: apiKey,
        pin_id: pinId,
        pin: code
      };

      const response = await axios.post(`${TERMII_URL}/verify`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.verified === "True" || response.data.verified === true) {
        return { success: true };
      }
      
      return { success: false, error: "Code invalide ou expiré." };
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.message || errorData?.error || "Erreur lors de la vérification.";
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: "Erreur lors de la vérification." };
    }
  }
};

// Format phone number for Benin (229)
// Format attendu: +2290167153974 (avec le code pays et le préfixe 01)
function formatBeninPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  
  // Already with 229 (format: 2290167153974)
  if (cleaned.startsWith("229")) {
    return cleaned;
  }
  
  // 10 digits with leading 0 (ex: 0167153974)
  // Garder le préfixe 01/04/etc. et ajouter 229
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    return "229" + cleaned; // Résultat: 2290167153974
  }
  
  // 8 digits (ex: 67153974) - format sans préfixe
  if (cleaned.length === 8 && /^[0-9]{8}$/.test(cleaned)) {
    // Pour les numéros à 8 chiffres, on peut ajouter 01 par défaut ou garder tel quel
    // Ici on garde tel quel: 22967153974
    return "229" + cleaned;
  }
  
  // 9 digits - format avec préfixe mais sans le 0 initial
  if (cleaned.length === 9 && /^[0-9]{9}$/.test(cleaned)) {
    return "229" + cleaned;
  }
  
  // Default: add 229 (but log warning)
  console.warn(`Phone number format might be invalid: ${phone} -> 229${cleaned}`);
  return "229" + cleaned;
}

