import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const { content, userId } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Nachrichteninhalt ist erforderlich' }, { status: 400 })
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        userId: userId || session.user?.id,
      },
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Fehler beim Erstellen der Nachricht:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}