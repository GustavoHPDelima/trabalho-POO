import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema de Biblioteca",
  description: "Gerenciamento de livros e empréstimos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body
        className={`${inter.className} bg-[var(--color-bg)] text-[var(--color-text)]`}
      >
        <header className="p-4 bg-[var(--color-surface)] border-b border-gray-800 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            📚 Biblioteca AFYA
          </h1>
          <nav className="space-x-4">
            <a
              href="/livros"
              className="hover:text-[var(--color-accent)] transition"
            >
              Livros
            </a>
            <a
              href="/emprestimos"
              className="hover:text-[var(--color-accent)] transition"
            >
              Empréstimos
            </a>
            <a
              href="/usuarios"
              className="hover:text-[var(--color-accent)] transition"
            >
              Usuários
            </a>
          </nav>
        </header>

        <main className="p-8">{children}</main>
      </body>
    </html>
  );
}
