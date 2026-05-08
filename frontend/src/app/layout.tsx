import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProbeBlade - API Security Testing',
  description: 'Automated API Security Testing Platform for OWASP API Top 10',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
