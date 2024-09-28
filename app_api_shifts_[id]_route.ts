import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

const prisma = new PrismaClient()

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  const id = params.id

  try {
    await prisma.shift.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Schicht erfolgreich gelöscht' })
  } catch (error) {
    console.error('Fehler beim Löschen der Schicht:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}