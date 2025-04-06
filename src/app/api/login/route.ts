// src/app/api/login/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { comparePassword, generateToken } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !comparePassword(password, user.password)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = generateToken({ id: user.id, email: user.email })

  return NextResponse.json({ token })
}
