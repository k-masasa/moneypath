import NextAuth from "next-auth";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signInSchema = z.object({
  email: z
    .string()
    .email()
    .max(255, { message: "メールアドレスは255文字以内である必要があります" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上である必要があります" })
    .max(128, { message: "パスワードは128文字以内である必要があります" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "パスワードは小文字、大文字、数字を含む必要があります",
    }),
});

// NextAuth v5 beta の型定義の問題を回避
// @ts-expect-error NextAuth v5 beta has type definition issues
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = signInSchema.parse(credentials);

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("メールアドレスまたはパスワードが正しくありません");
          }

          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            throw new Error("メールアドレスまたはパスワードが正しくありません");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error instanceof Error ? error.message : "Unknown error");
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
    updateAge: 24 * 60 * 60, // 24時間ごとに更新
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;
