// app/api/tasks/[id]/complete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const decoded = verifyToken(token) as { id: string }
    const task = await db.task.update({
      where: { id: params.id, userId: decoded.id },
      data: { completed: true }
    })
    return NextResponse.json({ message: 'Task updated', task })
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
