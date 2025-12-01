/**
 * Script de test pour diagnostiquer l'envoi de SMS via OurVoice
 * Usage: node scripts/test-ourvoice-sms.js
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const OURVOICE_API_URL = 'https://api.getourvoice.com/v1/messages';
const apiKey = process.env.OURVOICE_API_KEY;
const senderName = process.env.OURVOICE_SENDER_NAME || process.env.OURVOICE_SENDER_ID || 'Plombier';

// Numéro de test (remplacez par votre numéro)
const testPhone = '2290167153974'; // Format attendu par OurVoice

async function testSendSMS() {
  console.log('=== Test OurVoice SMS API ===\n');
  console.log('Configuration:');
  console.log('- API URL:', OURVOICE_API_URL);
  console.log('- API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NON CONFIGURÉE');
  console.log('- Sender Name:', senderName);
  console.log('- Test Phone:', testPhone);
  console.log('');

  if (!apiKey) {
    console.error('❌ ERREUR: OURVOICE_API_KEY non configurée dans .env.local');
    process.exit(1);
  }

  // Test 1: Format avec sender_name
  console.log('Test 1: Format avec sender_name');
  const payload1 = {
    to: [testPhone],
    body: 'Test SMS depuis script de diagnostic - OurVoice',
    sender_name: senderName,
  };

  try {
    console.log('Payload:', JSON.stringify(payload1, null, 2));
    const response1 = await axios.post(OURVOICE_API_URL, payload1, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Succès!');
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(response1.data, null, 2));
  } catch (error) {
    console.log('❌ Erreur:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }

  console.log('\n---\n');

  // Test 2: Format avec from (si sender_name ne fonctionne pas)
  console.log('Test 2: Format avec from');
  const payload2 = {
    to: [testPhone],
    body: 'Test SMS avec champ from - OurVoice',
    from: senderName,
  };

  try {
    console.log('Payload:', JSON.stringify(payload2, null, 2));
    const response2 = await axios.post(OURVOICE_API_URL, payload2, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    console.log('✅ Succès!');
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(response2.data, null, 2));
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

