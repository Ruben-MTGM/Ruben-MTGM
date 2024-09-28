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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2, Users, CalendarDays, MessageSquare, Upload, Eye, LogOut } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Session } from 'next-auth'

interface CustomSession extends Session {
  user?: {
    role?: string
  } & Session['user']
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Shift {
  id: string
  userId: string
  startTime: string
  endTime: string
  location: string
}

interface UploadedFile {
  id: string
  userId: string
  filename: string
  url: string
  createdAt: string
  user: {
    name: string
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [uploads, setUploads] = useState<UploadedFile[]>([])
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' })
  const [newShift, setNewShift] = useState({ userId: '', startTime: '', endTime: '', location: '' })
  const [message, setMessage] = useState({ userId: '', content: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [selectedUpload, setSelectedUpload] = useState<UploadedFile | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Nicht autorisiert. Bitte melden Sie sich erneut an.')
        } else if (res.status === 403) {
          throw new Error('Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.')
        } else {
          throw new Error('Benutzer konnten nicht abgerufen werden')
        }
      }
      const data = await res.json()
      setUsers(data)
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Benutzer konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    }
  }, [toast])

  const fetchShifts = useCallback(async () => {
    try {
      const res = await fetch('/api/shifts')
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Nicht autorisiert. Bitte melden Sie sich erneut an.')
        } else if (res.status === 403) {
          throw new Error('Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.')
        } else {
          throw new Error('Schichten konnten nicht abgerufen werden')
        }
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
  }, [toast])

  const fetchUploads = useCallback(async () => {
    try {
      const res = await fetch('/api/uploads')
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Nicht autorisiert. Bitte melden Sie sich erneut an.')
        } else if (res.status === 403) {
          throw new Error('Zugriff verweigert. Sie haben keine Berechtigung für diese Aktion.')
        } else {
          throw new Error('Uploads konnten nicht abgerufen werden')
        }
      }
      const data = await res.json()
      setUploads(data)
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Uploads konnten nicht abgerufen werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN')) {
      router.push('/login')
    } else {
      const fetchInitialData = async () => {
        await Promise.all([fetchUsers(), fetchShifts(), fetchUploads()])
        setIsInitialLoading(false)
      }
      fetchInitialData()
    }
  }, [status, session, router, fetchUsers, fetchShifts, fetchUploads])

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
      if (!res.ok) throw new Error('Benutzer konnte nicht erstellt werden')
      setNewUser({ name: '', email: '', password: '', role: 'USER' })
      fetchUsers()
      toast({
        title: "Erfolg",
        description: "Benutzer wurde erfolgreich erstellt.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Benutzer konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Benutzer konnte nicht gelöscht werden')
      fetchUsers()
      toast({
        title: "Erfolg",
        description: "Benutzer wurde erfolgreich gelöscht.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Benutzer konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift),
      })
      if (!res.ok) throw new Error('Schicht konnte nicht erstellt werden')
      setNewShift({ userId: '', startTime: '', endTime: '', location: '' })
      fetchShifts()
      toast({
        title: "Erfolg",
        description: "Schicht wurde erfolgreich erstellt.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Schicht konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Schicht konnte nicht gelöscht werden')
      fetchShifts()
      toast({
        title: "Erfolg",
        description: "Schicht wurde erfolgreich gelöscht.",
      })
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Schicht konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      })
      if (!res.ok) throw new Error('Nachricht konnte nicht gesendet werden')
      setMessage({ userId: '', content: '' })
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
            <h1 className="text-2xl font-bold">Admin-Dashboard</h1>
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
      <main className="container mx-auto px