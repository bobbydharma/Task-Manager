// src/app/api/tasks/route.ts
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// GET /api/tasks
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = verifyToken(token) as { id: string }

    const tasks = await db.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ tasks })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

// POST /api/tasks
export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = verifyToken(token) as { id: string }
    const body = await req.json()
    const { title } = body

    if (!title || title.trim().length < 1) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const task = await db.task.create({
      data: {
        title,
        userId: user.id,
      }
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
