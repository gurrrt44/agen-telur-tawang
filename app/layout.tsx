import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans-family",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Agen Telur Tawang",
  description:
    "Telur ayam negeri segar grade A pilihan, langsung dari peternakan mitra di Jombang. Pesan online, langsung diantar dihari yang sama dan semisal ada keterbatasan waktu akan dilanjutkan besok hari nya. Melayani rumah tangga, warung, dan resto.",
  keywords: [
    "telur ayam segar",
    "agen telur jombang",
    "jual telur online",
    "telur grade A",
    "telur tawang",
    "telur murah jombang",
    "supplier telur jombang",
  ],
  openGraph: {
    title: "Telur Mojokrapak — Agen Telur Segar Tawang Jombang",
    description:
      "Telur ayam negeri segar grade A pilihan, langsung dari peternakan mitra di Jombang. Pesan online, antar dalam 24 jam.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
