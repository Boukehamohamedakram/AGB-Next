"use client"

import Image from "next/image"
import Link from "next/link"

export function Header() {
  return (
    <header className="w-full flex justify-center py-4">
      <Link href="/">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PqGxvOBEBGrOyaHcovNoXXXrGyK1uG.png"
          alt="AGB Logo"
          width={120}
          height={120}
          className="h-16 w-auto"
          priority
        />
      </Link>
    </header>
  )
}
