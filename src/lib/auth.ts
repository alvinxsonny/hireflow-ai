import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/candidate/login",
    error: "/candidate/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "demo-login",
      name: "Demo Fast Login",
      credentials: {
        email: { label: "Email", type: "email" },
        role: { label: "Role", type: "text" }, // "RECRUITER" or "CANDIDATE"
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const role = credentials.role === "RECRUITER" ? "RECRUITER" : "CANDIDATE";
        const portal = role === "RECRUITER" ? "HR" : "CANDIDATE";
        const name = role === "RECRUITER" ? "HR Manager (Demo)" : "Candidate (Demo)";

        // Upsert user for demo/dev purposes
        try {
          const user = await prisma.user.upsert({
            where: { email: credentials.email },
            update: {
              role: role,
              portalAccess: portal,
            },
            create: {
              email: credentials.email,
              fullName: name,
              role: role,
              portalAccess: portal,
              emailVerified: true,
            },
          });
          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role,
            portalAccess: user.portalAccess,
          };
        } catch (e) {
          // Fallback if DB is not yet running locally
          return {
            id: `demo-${role.toLowerCase()}-id`,
            email: credentials.email,
            name: name,
            role: role,
            portalAccess: portal,
          };
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) return false;

          // Check if user already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Determine default role based on email or default to CANDIDATE
            await prisma.user.create({
              data: {
                email: user.email,
                fullName: user.name || "Google User",
                googleId: account.providerAccountId,
                avatarUrl: user.image,
                role: "CANDIDATE",
                portalAccess: "CANDIDATE",
                emailVerified: true,
              },
            });
          }
        } catch (error) {
          console.warn("[NextAuth] Database sync warning during Google OAuth:", error);
          // Allow login even if local DB is offline in demo
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CANDIDATE";
        token.portalAccess = (user as any).portalAccess || "CANDIDATE";
      }

      // Check DB for latest role if id is available
      if (token.email && (!token.role || token.role === "CANDIDATE")) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.portalAccess = dbUser.portalAccess;
          }
        } catch (e) {
          // Ignore if DB is not yet connected
        }
      }

      if (trigger === "update" && session) {
        token.role = session.role || token.role;
        token.portalAccess = session.portalAccess || token.portalAccess;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "CANDIDATE";
        (session.user as any).portalAccess = token.portalAccess || "CANDIDATE";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "hireflow-secret-fallback-key-32chars",
};

