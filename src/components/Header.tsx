"use client";

import { useTheme } from "@/providers/ThemeProvider";
import Link from "next/link";

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center p-4">
      <Link href="/" className=" font-bold">
        Home
      </Link>
      <Link href="/" className=" font-bold">
        Projects
      </Link>
      <h1 className="text-2xl font-bold">Header</h1>
      <Link href="/" className=" font-bold">
        Playground
      </Link>
      <Link href="/" className=" font-bold">
        Contact
      </Link>
    </header>
  );
}

export default Header;
