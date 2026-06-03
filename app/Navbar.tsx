import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm border-b h-24 px-8 flex items-center">
      <Link href="/" className="text-2xl font-bold font-playfair">
        TheVintageHouse
      </Link>
    </nav>
  );
}