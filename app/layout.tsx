import type { Metadata } from 'next'
import './globals.css'
import Head from "next/head";

export const metadata: Metadata = {
  title: 'Rage AI',
  description: 'Created By Abhinav ',
  generator: 'abhinxvz',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>
      <body>{children}</body>
    </html>
  )
}
