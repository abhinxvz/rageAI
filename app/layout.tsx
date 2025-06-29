import type { Metadata } from 'next'
import './globals.css'
import Head from "next/head";
import { Toaster } from "@/components/ui/toaster"
import { Poppins } from 'next/font/google'

const poppins = Poppins({ 
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700'],
})

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
      <body className={`${poppins.variable} font-poppins`}>{children}<Toaster /></body>
    </html>
  )
}
