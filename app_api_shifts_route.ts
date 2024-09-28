import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  try {
    let shifts
    if (session.user?.role === 'ADMIN') {
      shifts = await prisma.shift.findMany({
        include: { user: { select: { name: true } } },
      })
    } else if (userId) {
      shifts = await prisma.shift.findMany({
        where: { userId },
      })
    } else {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Fehler beim Abrufen der Schichten:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const { userId, startTime, endTime, location } = await request.json()

    if (!userId || !startTime || !endTime || !location) {
      return NextResponse.json({ error: 'Alle Felder sind erforderlich' }, { status: 400 })
    }

    const newShift = await prisma.shift.create({
      data: {
        userId,
        startTime,
        endTime,
        location,
      },
    })

    return NextResponse.json(newShift)
  } catch (error) {
    console.error('Fehler beim Erstellen der Schicht:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}