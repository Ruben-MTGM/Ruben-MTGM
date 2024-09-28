import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Willkommen bei MTGM Sicherheitsdienst</h1>
      <Link href="/login">
        <Button>Zum Login</Button>
      </Link>
    </main>
  )
}