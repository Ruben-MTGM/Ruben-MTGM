import './globals.css'
import { Inter } from 'next/font/google'
import { SessionProvider } from "next-auth/react"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'MTGM Sicherheitsdienst',
  description: 'Mitarbeiter-Management-System für MTGM Sicherheitsdienst',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}