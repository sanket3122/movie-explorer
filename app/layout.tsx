import "./globals.css";

export const metadata = {
  title: "Movie Explorer",
  description: "Search movies",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" >
      <body >
        {children}
      </body>
    </html>
  );
}
