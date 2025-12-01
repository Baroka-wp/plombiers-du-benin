/**
 * Script de test pour diagnostiquer l'envoi de SMS via OurVoice (Axios)
 * Usage: node scripts/test-ourvoice-sms.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const OURVOICE_API_URL = 'https://api.getourvoice.com/v1/messages';
const apiKey = process.env.OURVOICE_API_KEY;
const senderId = process.env.OURVOICE_SENDER_ID;
const senderName = process.env.OURVOICE_SENDER_NAME || 'Plombier';

// Numéro de test (remplacez par votre numéro si nécessaire)
const testPhone = '2290167153974'; // Format attendu par OurVoice (sans +)

async function testSendSMS() {
  console.log('=== Test OurVoice SMS API (Axios) ===\n');
  console.log('Configuration:');
  console.log('- API URL:', OURVOICE_API_URL);
  console.log('- API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NON CONFIGURÉE');
  console.log('- Sender ID (Numeric):', senderId || 'NON DÉFINI');
  console.log('- Sender Name (Alpha):', senderName);
  console.log('- Test Phone:', testPhone);
  console.log('');

  if (!apiKey) {
    console.error('❌ ERREUR: OURVOICE_API_KEY non configurée dans .env.local');
    process.exit(1);
  }

  // Construction du payload comme dans lib/sms.ts
  const payload = {
    to: [testPhone], // Tableau requis
    body: 'Test SMS depuis script de diagnostic - OurVoice Axios',
  };

  // Logique de sélection de l'expéditeur
  if (senderId && /^\d+$/.test(senderId)) {
    payload.sender_id = senderId;
    console.log('Using sender_id (Numeric):', senderId);
  } else {
    payload.sender_name = senderName;
    console.log('Using sender_name (Alpha):', senderName);
  }

  try {
    console.log('Payload:', JSON.stringify(payload, null, 2));
    const response = await axios.post(OURVOICE_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Succès!');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Erreur:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
}

testSendSMS().catch(console.error);
