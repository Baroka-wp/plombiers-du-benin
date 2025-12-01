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
      const senderId = process.env.OURVOICE_SENDER_ID; // Numeric ID
      const senderName = process.env.OURVOICE_SENDER_NAME || 'Plombier'; // Alphanumeric Name

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

      // Préparer le payload selon les spécifications OurVoice
      // 1. Le champ 'to' doit être un tableau de chaînes
      // 2. Il faut utiliser soit 'sender_id' (numérique) soit 'sender_name' (alphanumérique), l'un est OBLIGATOIRE
      const payload: any = {
        to: [formattedNumber], 
        body: message,
      };

      // Logique de sélection de l'expéditeur
      if (senderId && /^\d+$/.test(senderId)) {
        payload.sender_id = senderId;
      } else {
        // Utiliser sender_name (défaut 'Plombier') si pas de sender_id numérique
        payload.sender_name = senderName;
      }

      console.log('Sending OTP via OurVoice (Axios):', { 
        url: OURVOICE_API_URL,
        payload: JSON.stringify(payload, null, 2)
      });

      const response = await axios.post(OURVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      console.log('OurVoice API Response:', {
        status: response.status,
        data: JSON.stringify(response.data, null, 2)
      });

      // Vérifier le succès (Supporte différents formats de réponse)
      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        
        // Cas 1: { data: { status: 'sent' ... } }
        if (data?.data?.status === 'sent' || data?.data?.status === 'queued' || data?.data?.status === 'pending') {
          return { success: true, pinId: otpRecord.id };
        }
        
        // Cas 2: { status: 'sent' ... } directement à la racine
        if (data?.status === 'sent' || data?.status === 'queued' || data?.status === 'pending') {
          return { success: true, pinId: otpRecord.id };
        }
        
        // Si pas d'erreur explicite, on considère comme succès si status HTTP OK
        if (!data?.error && !data?.message) {
           console.warn('OurVoice response format unclear but HTTP OK, assuming success');
           return { success: true, pinId: otpRecord.id };
        }
      }

      // Si l'envoi échoue, supprimer le code OTP de la base
      await prisma.otpCode.delete({ where: { id: otpRecord.id } });
      
      throw new Error(response.data?.message || response.data?.error || "Erreur d'envoi inconnue");
    } catch (error) {
      console.error('Erreur SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          console.error('OurVoice API Error Response:', {
            status: error.response.status,
            data: errorData,
          });

          let errorMessage = "Impossible d'envoyer le SMS.";
          
          // Extraire le message d'erreur
          if (errorData?.message) errorMessage = errorData.message;
          else if (errorData?.error) errorMessage = errorData.error;
          
          // Erreurs de validation (array)
          if (errorData?.data && Array.isArray(errorData.data)) {
             errorMessage = `Validation: ${errorData.data.join(', ')}`;
          }

          if (error.response.status === 401) errorMessage = "Identifiants OurVoice invalides.";
          else if (error.response.status === 402) errorMessage = "Crédits insuffisants.";

          return { success: false, error: errorMessage };
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
        console.error('Prisma OtpCode model not available.');
        return { success: false, error: "Service SMS non configuré." };
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
      const senderId = process.env.OURVOICE_SENDER_ID;
      const senderName = process.env.OURVOICE_SENDER_NAME || 'Plombier';

      if (!apiKey) {
        return { success: false, error: "OURVOICE_API_KEY non configurée" };
      }

      const formattedNumber = formatBeninPhoneNumberForOurVoice(phoneNumber);

      // Payload construction strict
      const payload: any = {
        to: [formattedNumber], // Array required
        body: message,
      };

      if (senderId && /^\d+$/.test(senderId)) {
        payload.sender_id = senderId;
      } else {
        payload.sender_name = senderName;
      }

      console.log('Sending SMS via OurVoice (Axios):', { 
        url: OURVOICE_API_URL,
        payload: JSON.stringify(payload, null, 2)
      });

      const response = await axios.post(OURVOICE_API_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        timeout: 10000,
      });

      console.log('OurVoice API Response:', {
        status: response.status,
        data: JSON.stringify(response.data, null, 2)
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        const messageId = data?.data?.id || data?.id;
        
        if (messageId) {
          return { success: true, messageId };
        }
      }

      const errorMsg = response.data?.message || "Erreur d'envoi";
      return { success: false, error: errorMsg };
    } catch (error) {
      console.error('Erreur envoi SMS:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorData = error.response.data;
          console.error('OurVoice API Error Response:', {
            status: error.response.status,
            data: errorData,
          });
          
          let errorMessage = "Impossible d'envoyer le SMS.";
          if (errorData?.message) errorMessage = errorData.message;
          if (errorData?.data && Array.isArray(errorData.data)) {
             errorMessage = `Validation: ${errorData.data.join(', ')}`;
          }
          
          return { success: false, error: errorMessage };
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
