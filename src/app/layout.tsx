// src/app/layout.tsx (NOT just app/(auth)/layout.tsx)
import { Providers } from "@/src/store/providers";
import { Toaster } from "react-hot-toast";
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title> DevHuddle</title>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />

      </head>
      <body>
    
       <Toaster position="top-center" />
       <Providers>{children}</Providers>
       {/* {children} */}

      </body>
    </html>
  );
}

