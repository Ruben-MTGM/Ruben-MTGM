'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CalendarDays, MessageSquare, Upload, LogOut } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import Image from 'next/image'

interface Shift {
  id: string
  userId: string
  startTime: string
  endTime: string
  location: string
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [message, setMessage] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const fetchShifts = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      const res = await fetch(`/api/shifts?userId=${session.user.id}`)
      if (!res.ok) {
        throw new Error('Schichten konnten nicht abgerufen werden')
      }
      const data = await res.json()
      setShifts(data)
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Schichten konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    }
  }, [session, toast])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchShifts()
      setIsInitialLoading(false)
    }
  }, [status, router, fetchShifts])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message, userId: session?.user?.id }),
      })
      if (!res.ok) throw new Error('Nachricht konnte nicht gesendet werden')
      setMessage('')
      toast({
        title: "Erfolg",
        description: "Nachricht wurde erfolgreich gesendet.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', session?.user?.id || '')

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error('Datei konnte nicht hochgeladen werden')
      setFile(null)
      toast({
        title: "Erfolg",
        description: "Datei wurde erfolgreich hochgeladen.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Datei konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isInitialLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black text-white shadow-lg">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_9239-zjBteXIYllMUJgbWgGATs4egdYFjLY.png"
              alt="MTGM Sicherheitsdienst Logo"
              width={100}
              height={50}
              className="h-10 w-auto mr-4"
            />
            <h1 className="text-2xl font-bold">Benutzer-Dashboard</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-white hover:text-gray-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs defaultValue="shifts" className="space-y-4">
            <TabsList className="bg-white shadow-md rounded-lg p-1">
              <TabsTrigger value="shifts" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <CalendarDays className="w-4 h-4 mr-2" />
                Schichten
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" />
                Nachrichten
              </TabsTrigger>
              <TabsTrigger value="uploads" className="data-[state=active]:bg-black data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />
                Uploads
              </TabsTrigger>
            </TabsList>
            <TabsContent value="shifts">
              <Card className="shadow-lg border-t-4 border-black">
                <CardHeader className="bg-gray-50">
                  <CardTitle>Meine Schichten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {shifts.map((shift) => (
                      <motion.div
                        key={shift.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 bg-white rounded-lg shadow"
                      >
                        <p className="font-semibold">
                          {new Date(shift.startTime).toLocaleString()} - {new Date(shift.endTime).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Ort: {shift.location}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="messages">
              <Card className="shadow-lg border-t-4 border-black">
                <CardHeader className="bg-gray-50">
                  <CardTitle>Nachricht an Admin senden</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="messageContent">Nachricht</Label>
                      <Input
                        id="messageContent"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-2" />
                      )}
                      Nachricht senden
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="uploads">
              <Card className="shadow-lg border-t-4 border-black">
                <CardHeader className="bg-gray-50">
                  <CardTitle>Datei hochladen</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Datei auswählen</Label>
                      <Input
                        id="file"
                        type="file"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        required
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <Button type="submit" disabled={isLoading || !file} className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200">
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Datei hochladen
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}