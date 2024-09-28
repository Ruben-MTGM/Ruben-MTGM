import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const uploads = await prisma.upload.findMany({
      include: { user: { select: { name: true } } },
    })
    return NextResponse.json(uploads)
  } catch (error) {
    console.error('Fehler beim Abrufen der Uploads:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name}`

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`

    const upload = await prisma.upload.create({
      data: {
        filename: file.name,
        url,
        userId: userId || session.user?.id,
      },
    })

    return NextResponse.json(upload)
  } catch (error) {
    console.error('Fehler beim Hochladen der Datei:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}