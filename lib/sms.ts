import axios from 'axios';
import { prisma } from './prisma';

// OurVoice SMS API
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
      // OurVoice: Le champ 'to' doit être un tableau
      // Selon la doc, on peut utiliser 'from', 'sender_id' ou 'sender_name'
      const payload: any = {
        to: [formattedNumber], // Tableau de numéros (requis)
        body: message,
      };
      
      // Essayer d'abord 'from' (format le plus courant selon la doc)
      if (process.env.OURVOICE_SENDER_NAME) {
        payload.from = process.env.OURVOICE_SENDER_NAME;
      } else if (process.env.OURVOICE_SENDER_ID) {
        // Si c'est un ID numérique, utiliser sender_id, sinon from
        if (/^\d+$/.test(process.env.OURVOICE_SENDER_ID)) {
          payload.sender_id = process.env.OURVOICE_SENDER_ID;
        } else {
          payload.from = process.env.OURVOICE_SENDER_ID;
        }
      } else if (senderId) {
        // Fallback: utiliser 'from' par défaut
        payload.from = senderId;
      }

      // Log détaillé du payload avant envoi
      console.log('Sending OTP via OurVoice:', { 
        url: OURVOICE_API_URL,
        payload: JSON.stringify(payload, null, 2),
        formattedNumber,
        senderId,
        hasApiKey: !!apiKey,
      });

      const response = await axios.post(OURVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      // Log de la réponse complète pour diagnostic
      console.log('OurVoice API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(response.data, null, 2),
      });

      // OurVoice retourne { data: { id, status, ... } }
      if (response.status === 200 || response.status === 201) {
        // Vérifier différents formats de réponse possibles
        const responseData = response.data;
        
        // Format 1: { data: { id, status, ... } }
        if (responseData?.data) {
          const messageData = responseData.data;
          if (messageData.status === 'sent' || messageData.status === 'queued' || messageData.status === 'pending') {
            return { success: true, pinId: otpRecord.id };
          }
        }
        
        // Format 2: { id, status, ... } directement
        if (responseData?.id && (responseData.status === 'sent' || responseData.status === 'queued' || responseData.status === 'pending')) {
          return { success: true, pinId: otpRecord.id };
        }
        
        // Si on arrive ici, la réponse est 200 mais le format n'est pas reconnu
        console.warn('OurVoice response format not recognized:', responseData);
      }

      // Si l'envoi échoue, supprimer le code OTP de la base
      await prisma.otpCode.delete({ where: { id: otpRecord.id } });
      
      throw new Error(response.data?.message || response.data?.error || "Erreur d'envoi");
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

      // OurVoice: Le champ 'to' doit être un tableau
      // Selon la doc, on peut utiliser 'from', 'sender_id' ou 'sender_name'
      const payload: any = {
        to: [formattedNumber], // Tableau de numéros (requis)
        body: message,
      };
      
      // Essayer d'abord 'from' (format le plus courant selon la doc)
      if (process.env.OURVOICE_SENDER_NAME) {
        payload.from = process.env.OURVOICE_SENDER_NAME;
      } else if (process.env.OURVOICE_SENDER_ID) {
        // Si c'est un ID numérique, utiliser sender_id, sinon from
        if (/^\d+$/.test(process.env.OURVOICE_SENDER_ID)) {
          payload.sender_id = process.env.OURVOICE_SENDER_ID;
        } else {
          payload.from = process.env.OURVOICE_SENDER_ID;
        }
      } else if (senderId) {
        // Fallback: utiliser 'from' par défaut
        payload.from = senderId;
      }

      // Log détaillé du payload avant envoi
      console.log('Sending SMS via OurVoice:', { 
        url: OURVOICE_API_URL,
        payload: JSON.stringify(payload, null, 2),
        formattedNumber,
        senderId,
        hasApiKey: !!apiKey,
      });

      const response = await axios.post(OURVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      // Log de la réponse complète pour diagnostic
      console.log('OurVoice API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: JSON.stringify(response.data, null, 2),
      });

      // OurVoice retourne { data: { id, status, ... } }
      if (response.status === 200 || response.status === 201) {
        // Vérifier différents formats de réponse possibles
        const responseData = response.data;
        
        // Format 1: { data: { id, status, ... } }
        if (responseData?.data) {
          const messageData = responseData.data;
          if (messageData.status === 'sent' || messageData.status === 'queued' || messageData.status === 'pending') {
            return { 
              success: true, 
              messageId: messageData.id 
            };
          }
        }
        
        // Format 2: { id, status, ... } directement
        if (responseData?.id && (responseData.status === 'sent' || responseData.status === 'queued' || responseData.status === 'pending')) {
          return { 
            success: true, 
            messageId: responseData.id 
          };
        }
        
        // Si on arrive ici, la réponse est 200 mais le format n'est pas reconnu
        console.warn('OurVoice response format not recognized:', responseData);
      }

      const errorMsg = response.data?.message || response.data?.error || "Erreur d'envoi";
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          const status = error.response.status;
          
          // Log détaillé pour debug
          const formattedNumber = formatBeninPhoneNumberForOurVoice(phoneNumber);
          const senderIdForLog = process.env.OURVOICE_SENDER_ID || process.env.OURVOICE_SENDER_NAME || 'Plombier';
          console.error('OurVoice API Error Response:', {
            status,
            data: errorData,
            payload: {
              to: formattedNumber,
              body: message.substring(0, 50) + '...',
              sender_id: senderIdForLog,
            }
          });
          
          let errorMessage = "Impossible d'envoyer le SMS.";
          
          // OurVoice peut retourner des erreurs de validation détaillées
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.errors) {
            // Si c'est un objet d'erreurs de validation
            const errors = Array.isArray(errorData.errors) 
              ? errorData.errors.join(', ')
              : JSON.stringify(errorData.errors);
            errorMessage = `Erreurs de validation: ${errors}`;
          }

          if (status === 401) {
            errorMessage = "Identifiants OurVoice invalides.";
          } else if (status === 402) {
            errorMessage = "Crédits insuffisants. Rechargez votre compte OurVoice.";
          } else if (status === 422) {
            errorMessage = errorMessage || "Erreurs de validation. Vérifiez le format du numéro et du message.";
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

