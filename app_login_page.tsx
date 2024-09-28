'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          throw new Error("Ungültige E-Mail oder Passwort")
        } else {
          throw new Error(result.error)
        }
      }

      toast({
        title: "Erfolgreich angemeldet",
        description: "Sie werden zum Dashboard weitergeleitet.",
      })

      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: "Fehler bei der Anmeldung",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-t-4 border-black">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_9239-zjBteXIYllMUJgbWgGATs4egdYFjLY.png"
                alt="MTGM Sicherheitsdienst Logo"
                width={100}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Anmelden</CardTitle>
            <CardDescription className="text-center">
              Geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@beispiel.de"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wird angemeldet...
                  </>
                ) : (
                  'Anmelden'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}