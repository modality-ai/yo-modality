import React from "react";

export interface RootLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

export default function RootLayout({ children, title = "App" }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <link rel="stylesheet" href="/styles/tailwind.css" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
