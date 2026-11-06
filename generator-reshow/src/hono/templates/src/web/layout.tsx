import React from "react";
import { readFileSync } from "node:fs";

export interface RootLayoutProps {
  children?: React.ReactNode;
  title?: string;
  cssHref?: string;
}

function resolveCssHref(): string {
  try {
    const manifestPath = new URL("../../public/styles/manifest.json", import.meta.url).pathname;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
    return manifest.style ?? manifest.tailwind ?? "/styles/style.css";
  } catch {
    return "/styles/style.css";
  }
}

export default function RootLayout({ children, title = "App", cssHref }: RootLayoutProps) {
  const href = cssHref ?? resolveCssHref();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <link rel="stylesheet" href={href} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
