import axios from 'axios';
import { prisma } from './prisma';

// OurVoice SMS API
// Note: Vérifiez l'URL de base exacte dans votre documentation OurVoice
// Options possibles: https://api.getourvoice.com, https://getourvoice.com/api, etc.
const OURVOICE_BASE_URL = process.env.OURVOICE_BASE_URL || 'https://api.getourvoice.com';
const OURVOICE_API_URL = `${OURVOICE_BASE_URL}/v1/messages`;

export interface SendOTPResult {
  success: boolean;
  pinId?: string;
  error?: string;
}

export interface VerifyOTPResult {
  success: boolean;
  error?: string;
}

export interface SendSMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const smsService = {
  /**
   * Envoie un code OTP au numéro spécifié
   */
  async sendOTP(phoneNumber: string): Promise<SendOTPResult> {
    try {
      const apiKey = process.env.OURVOICE_API_KEY;
      const senderId = process.env.OURVOICE_SENDER_ID || process.env.OURVOICE_SENDER_NAME || 'Plombier';

      if (!apiKey) {
        return { success: false, error: "OURVOICE_API_KEY non configurée" };
      }

      // Formatage du numéro pour le Bénin (OurVoice attend le format sans +)
      const formattedNumber = formatBeninPhoneNumberForOurVoice(phoneNumber);

      // Vérifier que le modèle OtpCode est disponible
      if (!prisma.otpCode) {
        console.error('Prisma OtpCode model not available. Please restart the Next.js server and run: npx prisma generate && npx prisma db push');
        return { success: false, error: "Service SMS non configuré. Veuillez redémarrer le serveur." };
      }

      // Générer un code OTP à 6 chiffres
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Stocker le code dans la base de données avec expiration (5 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const otpRecord = await prisma.otpCode.create({
        data: {
          phone: formattedNumber,
          code: code,
          expiresAt: expiresAt,
        },
      });

      // Message SMS
      const message = `Votre code de verification pour l'Annuaire des Plombiers est ${code}. Valide 5 min.`;

      // Envoyer le SMS via OurVoice
      const payload = {
        to: formattedNumber,
        body: message,
        sender_id: senderId,
      };

      console.log('Sending OTP via OurVoice:', { 
        to: formattedNumber,
        url: OURVOICE_API_URL 
      });

      const response = await axios.post(OURVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      // OurVoice retourne { data: { id, status, ... } }
      if (response.status === 200 && response.data?.data) {
        const messageData = response.data.data;
        if (messageData.status === 'sent' || messageData.status === 'queued') {
          return { success: true, pinId: otpRecord.id };
        }
      }

      // Si l'envoi échoue, supprimer le code OTP de la base
      await prisma.otpCode.delete({ where: { id: otpRecord.id } });
      
      throw new Error(response.data?.message || "Erreur d'envoi");
    } catch (error) {
      console.error('Erreur SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          const status = error.response.status;
          
          console.error('OurVoice API Error Response:', {
            status,
            data: errorData,
          });

          let errorMessage = "Impossible d'envoyer le SMS.";
          
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }

          if (status === 400) {
            errorMessage = errorMessage || "Requête invalide. Vérifiez le format du numéro.";
          } else if (status === 401) {
            errorMessage = "Identifiants OurVoice invalides. Vérifiez OURVOICE_API_KEY.";
          } else if (status === 402) {
            errorMessage = "Crédits insuffisants. Rechargez votre compte OurVoice.";
          } else if (status === 500) {
            errorMessage = errorMessage || "Erreur serveur OurVoice. Réessayez plus tard.";
          }

          return { success: false, error: errorMessage };
        } else if (error.request) {
          console.error('No response from OurVoice API:', error.request);
          return { success: false, error: "Pas de réponse du serveur SMS. Vérifiez votre connexion." };
        }
      }

      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: `Impossible d'envoyer le SMS: ${errorMessage}` };
    }
  },

  /**
   * Vérifie le code saisi par l'utilisateur
   */
  async verifyOTP(pinId: string, code: string): Promise<VerifyOTPResult> {
    try {
      // Vérifier que le modèle OtpCode est disponible
      if (!prisma.otpCode) {
        console.error('Prisma OtpCode model not available. Please restart the Next.js server and run: npx prisma generate && npx prisma db push');
        return { success: false, error: "Service SMS non configuré. Veuillez redémarrer le serveur." };
      }

      // Récupérer le code OTP depuis la base de données
      const otpRecord = await prisma.otpCode.findUnique({
        where: { id: pinId },
      });

      if (!otpRecord) {
        return { success: false, error: "Code OTP non trouvé." };
      }

      // Vérifier si le code a déjà été utilisé
      if (otpRecord.verified) {
        return { success: false, error: "Ce code a déjà été utilisé." };
      }

      // Vérifier si le code a expiré
      if (new Date() > otpRecord.expiresAt) {
        await prisma.otpCode.delete({ where: { id: pinId } });
        return { success: false, error: "Code expiré. Veuillez en demander un nouveau." };
      }

      // Vérifier le code
      if (otpRecord.code !== code) {
        return { success: false, error: "Code invalide." };
      }

      // Marquer le code comme vérifié
      await prisma.otpCode.update({
        where: { id: pinId },
        data: { verified: true },
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur vérification OTP:', error);
      return { success: false, error: "Erreur lors de la vérification." };
    }
  },

  /**
   * Envoie un SMS générique (non OTP)
   */
  async sendSMS(phoneNumber: string, message: string): Promise<SendSMSResult> {
    try {
      const apiKey = process.env.OURVOICE_API_KEY;
      const senderId = process.env.OURVOICE_SENDER_ID || process.env.OURVOICE_SENDER_NAME || 'Plombier';

      if (!apiKey) {
        return { success: false, error: "OURVOICE_API_KEY non configurée" };
      }

      // Formatage du numéro pour le Bénin (OurVoice attend le format sans +)
      const formattedNumber = formatBeninPhoneNumberForOurVoice(phoneNumber);

      const payload = {
        to: formattedNumber,
        body: message,
        sender_id: senderId,
      };

      console.log('Sending SMS via OurVoice:', { 
        to: formattedNumber,
        url: OURVOICE_API_URL 
      });

      const response = await axios.post(OURVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      // OurVoice retourne { data: { id, status, ... } }
      if (response.status === 200 && response.data?.data) {
        const messageData = response.data.data;
        if (messageData.status === 'sent' || messageData.status === 'queued') {
          return { 
            success: true, 
            messageId: messageData.id 
          };
        }
      }

      const errorMsg = response.data?.message || "Erreur d'envoi";
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          const status = error.response.status;
          
          let errorMessage = "Impossible d'envoyer le SMS.";
          
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          }

          if (status === 401) {
            errorMessage = "Identifiants OurVoice invalides.";
          } else if (status === 402) {
            errorMessage = "Crédits insuffisants. Rechargez votre compte OurVoice.";
          }

          return { success: false, error: errorMessage };
        } else if (error.request) {
          return { success: false, error: "Pas de réponse du serveur SMS. Vérifiez votre connexion." };
        }
      }

      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      return { success: false, error: `Impossible d'envoyer le SMS: ${errorMessage}` };
    }
  }
};

// Format phone number for Benin (229) - Format pour OurVoice
// Format attendu: 2290167153974 (sans le préfixe +)
function formatBeninPhoneNumberForOurVoice(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  let formatted = "";
  
  // Already with 229 (format: 2290167153974)
  if (cleaned.startsWith("229")) {
    formatted = cleaned;
  }
  // 10 digits with leading 0 (ex: 0167153974)
  // Garder le préfixe 01/04/etc. et ajouter 229
  else if (cleaned.length === 10 && cleaned.startsWith("0")) {
    formatted = "229" + cleaned; // Résultat: 2290167153974
  }
  // 8 digits (ex: 67153974) - format sans préfixe
  else if (cleaned.length === 8 && /^[0-9]{8}$/.test(cleaned)) {
    // Pour les numéros à 8 chiffres, on garde tel quel: 22967153974
    formatted = "229" + cleaned;
  }
  // 9 digits - format avec préfixe mais sans le 0 initial
  else if (cleaned.length === 9 && /^[0-9]{9}$/.test(cleaned)) {
    formatted = "229" + cleaned;
  }
  // Default: add 229 (but log warning)
  else {
    console.warn(`Phone number format might be invalid: ${phone} -> 229${cleaned}`);
    formatted = "229" + cleaned;
  }
  
  // OurVoice attend le format sans le préfixe +
  return formatted;
}

