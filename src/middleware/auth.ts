// src/middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export function authMiddleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 })
  }

  try {
    verifyToken(token)
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
