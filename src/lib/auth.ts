import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

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
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) return false;

          let portalIntent = "CANDIDATE";
          try {
            const cookieStore = cookies();
            const intentVal = cookieStore.get("auth_portal_intent")?.value;
            if (intentVal === "HR") {
              portalIntent = "HR";
            }
          } catch (e) {
            // Context without cookies access
          }

          const targetRole = portalIntent === "HR" ? "RECRUITER" : "CANDIDATE";
          const targetPortal = portalIntent === "HR" ? "HR" : "CANDIDATE";

          // Upsert user in database with the chosen portal role
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                fullName: user.name || "Google User",
                googleId: account.providerAccountId,
                avatarUrl: user.image,
                role: targetRole,
                portalAccess: targetPortal,
                emailVerified: true,
              },
            });
          } else {
            // If the user signed in through HR portal, grant RECRUITER role
            if (portalIntent === "HR") {
              await prisma.user.update({
                where: { email: user.email },
                data: {
                  role: "RECRUITER",
                  portalAccess: "HR",
                },
              });
            }
          }
        } catch (error) {
          console.warn("[NextAuth] Database sync warning during Google OAuth:", error);
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

      // Check portal intent cookie
      let portalIntent: string | undefined;
      try {
        const cookieStore = cookies();
        portalIntent = cookieStore.get("auth_portal_intent")?.value;
      } catch (e) {}

      if (portalIntent === "HR") {
        token.role = "RECRUITER";
        token.portalAccess = "HR";
      }

      // Sync role from DB
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = portalIntent === "HR" ? "RECRUITER" : dbUser.role;
            token.portalAccess = portalIntent === "HR" ? "HR" : dbUser.portalAccess;
          }
        } catch (e) {
          // Ignore if DB is not reachable
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
