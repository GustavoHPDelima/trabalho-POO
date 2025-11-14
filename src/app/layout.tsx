import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Biblioteca AFYA",
  description: "Sistema de Gerenciamento de Biblioteca",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.className} bg-slate-900 text-slate-100 antialiased`}
      >
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold">
                Biblioteca <span className="text-red-500">AFYA</span>
              </h1>
            </Link>

            <nav className="hidden md:flex space-x-8">
              {["Livros", "Emprestimos", "Usuarios"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-slate-300 hover:text-white font-medium text-sm transition-colors relative header-link"
                >
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="min-h-screen px-6 py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
