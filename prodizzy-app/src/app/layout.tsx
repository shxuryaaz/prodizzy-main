import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prodizzy — AI Chief of Staff',
  description: 'Prodizzy is your AI Chief of Staff. Every investor, candidate, partnership, and opportunity — ranked by what matters.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
