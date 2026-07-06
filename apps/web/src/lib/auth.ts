import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';

// We need a singleton pattern for PrismaClient since this runs at edge
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;
try {
  const { PrismaClient: PC } = require('@prisma/client');
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PC();
  }
  prisma = globalForPrisma.prisma;
} catch {
  // Prisma not available in edge runtime; this file won't be used there
  prisma = {} as PrismaClient;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma as any) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      type: 'oidc' as const,
      clientId: process.env.AUTH_MICROSOFT_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_SECRET!,
      issuer: 'https://login.microsoftonline.com/common/v2.0',
      wellKnown:
        'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
      authorization: {
        params: { scope: 'openid profile email User.Read' },
      },
      idToken: true,
      checks: ['pkce', 'state'] as ('pkce' | 'state')[],
      client: {
        token_endpoint_auth_method: 'none' as const,
      },
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.displayName,
          email: profile.email ?? profile.mail,
          image: null,
        };
      },
    },
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await (prisma as PrismaClient).user.findUnique({
          where: { email: credentials.email as string },
          include: {
            tenantMemberships: {
              include: { tenant: true },
            },
          },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          tenantId: user.tenantMemberships[0]?.tenantId ?? null,
          roles: user.tenantMemberships.map((m) => m.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id as string;
        token.roles = user.roles ?? [];
        token.tenantId = user.tenantId ?? null;
      }
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.roles = token.roles as string[];
        session.user.tenantId = token.tenantId as string | null;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
