import type { NextAuthOptions, User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from './db';
import { AdapterUser } from 'next-auth/adapters';

declare module 'next-auth' {
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Query your database to find the user
          const users = await query(
            'SELECT * FROM users WHERE email = ?',
            [credentials.email]
          ) as any[];

          if (!users || users.length === 0) {
            return null;
          }

          const user = users[0];
          
          // First check if the password matches directly (for development)
          if (user.Password === credentials.password) {
            console.log('Logged in with plain text password (for development only)');
          } 
          // Then check if it matches the hashed password
          else if (user.PasswordHash) {
            const bcrypt = require('bcrypt');
            const isPasswordValid = await bcrypt.compare(credentials.password, user.PasswordHash);
            
            if (!isPasswordValid) {
              console.error('Invalid password for user:', credentials.email);
              return null;
            }
          } 
          // If neither matches, reject the login
          else {
            console.error('Invalid password for user:', credentials.email);
            return null;
          }

          // Return user data that will be stored in the session
          return {
            id: user.user_id.toString(),
            email: user.email,
            name: user.user_name,
          };
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User | AdapterUser }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};