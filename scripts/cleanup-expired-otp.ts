/**
 * Script de nettoyage des codes OTP expirés
 * 
 * Ce script supprime tous les codes OTP expirés de la base de données.
 * Peut être exécuté périodiquement via un cron job.
 * 
 * Usage: npx tsx scripts/cleanup-expired-otp.ts
 */

import { prisma } from '../lib/prisma';

async function cleanupExpiredOTP() {
  try {
    const now = new Date();
    
    // Supprimer tous les codes OTP expirés
    const result = await prisma.otpCode.deleteMany({
      where: {
        expiresAt: {
          lt: now, // Less than now = expired
        },
      },
    });

    console.log(`✅ ${result.count} code(s) OTP expiré(s) supprimé(s)`);
    
    // Optionnel: supprimer aussi les codes déjà vérifiés (plus de 24h)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const verifiedResult = await prisma.otpCode.deleteMany({
      where: {
        verified: true,
        createdAt: {
          lt: oneDayAgo,
        },
      },
    });

    console.log(`✅ ${verifiedResult.count} code(s) OTP vérifié(s) ancien(s) supprimé(s)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  }
}

cleanupExpiredOTP();

