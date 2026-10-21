import "./globals.css";

export const metadata = {
  title: "Chronix | Private Messaging",
  description: "Premium, private and encrypted communication.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning={true}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
