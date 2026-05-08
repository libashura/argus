import './globals.css'

export const metadata = {
  title: 'ProbeBlade - API Security Testing',
  description: 'Automated API Security Testing Platform for OWASP API Top 10',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
