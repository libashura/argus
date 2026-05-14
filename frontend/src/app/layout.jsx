import './globals.css'

export const metadata = {
  title: 'Argus  - API Security Testing',
  description: 'Automated API Security Testing Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
