import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        telephone: { label: "Téléphone", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.telephone || !credentials?.password) {
          throw new Error("Téléphone et mot de passe requis");
        }

        // Trouver le plombier par téléphone
        const plumber = await prisma.plumber.findUnique({
          where: { telephone: credentials.telephone },
        });

        if (!plumber) {
          throw new Error("Aucun compte trouvé avec ce numéro");
        }

        // Vérifier si le plombier a un mot de passe
        if (!plumber.password) {
          throw new Error("Veuillez créer un mot de passe");
        }

        // Vérifier le mot de passe
        const isValid = await bcrypt.compare(
          credentials.password,
          plumber.password
        );

        if (!isValid) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: plumber.id,
          name: `${plumber.prenom} ${plumber.nom}`,
          email: plumber.telephone,
          image: plumber.photoUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/artisan/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

