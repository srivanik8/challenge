import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import "./globals.css"

const inter = Inter({ subsets: ['latin'] })

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata = {
  title: 'Task Manager',
  description: 'A simple task management application',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${geistSans.variable}`}>
          {children}
      </body>
    </html>
  );
}
