import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'author-password',
      credentials: {
        password: { label: 'Author Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null
        }

        // Simple password check for author access
        const authorPassword = process.env.AUTHOR_PASSWORD || 'pitchbase2024'
        
        if (credentials.password === authorPassword) {
          // Find or create the author user in the database
          let user = await prisma.user.findUnique({
            where: { email: 'author@pitchbase.com' }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: 'author@pitchbase.com',
                name: 'Author',
                role: 'AUTHOR',
              }
            })
          } else {
            // Update role to ensure AUTHOR
            user = await prisma.user.update({
              where: { id: user.id },
              data: { role: 'AUTHOR' }
            })
          }

          // Return user object for JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
