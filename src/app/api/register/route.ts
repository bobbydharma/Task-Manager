// src/app/api/register/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
  }

  const hashed = hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
    },
  })

  return NextResponse.json({ message: 'User registered successfully', user: { id: user.id, email: user.email } })
}
