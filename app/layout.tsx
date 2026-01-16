import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import './tokens.css'
import './complexity-styles.css'
import './complexity-selector.css'
import './beginner-interface.css'
import './intermediate-interface.css'
import './expert-interface.css'
import './banner-buttons.css'
import './action-buttons.css'
import './globals-tablet.css'
import './globals-mobile.css'
import './globals-pastel-clean.css'
import './force-colors.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })
const sora = Sora({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-sora' })

export const metadata: Metadata = {
  title: 'Kdo Loto Gagnant',
  description: 'Application d\'analyse du Loto National français',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} ${sora.variable}`}>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgb(100 116 139)', // slate-500 pastel foncé
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            success: {
              style: {
                background: 'rgb(34 197 94)', // emerald-500
                color: '#fff',
              },
            },
            error: {
              style: {
                background: 'rgb(239 68 68)', // rose-500
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}