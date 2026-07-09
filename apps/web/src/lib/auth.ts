import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
    {
      id: 'microsoft',
      name: 'Microsoft 365',
      type: 'oidc' as const,
      clientId: process.env.AUTH_MICROSOFT_ID || '',
      clientSecret: process.env.AUTH_MICROSOFT_SECRET || '',
      issuer: 'https://login.microsoftonline.com/common/v2.0',
      wellKnown: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
      authorization: { params: { scope: 'openid profile email User.Read' } },
      idToken: true,
      checks: ['pkce', 'state'] as ('pkce' | 'state')[],
      client: { token_endpoint_auth_method: 'none' as const },
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
        // Auth is handled by the NestJS API - this is just the UI layer
        try {
          // Note: authorize() runs server-side, so NEXT_PUBLIC_ vars are unavailable.
          // Use API_URL first, then fall back for backwards compatibility.
          const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://campusos-api-production-c965.up.railway.app';
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
