import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { Hono } from "hono";
import { staticHandler } from "./static";
import React from "react";
import { renderToString } from "react-dom/server";

const webDir = join(import.meta.dir, "..", "web");

function discoverFiles(dir: string, base = "", pattern: RegExp): Map<string, string> {
  const routes = new Map<string, string>();
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return routes;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      const sub = discoverFiles(full, base ? `${base}/${name}` : name, pattern);
      for (const [r, f] of sub) routes.set(r, f);
      continue;
    }
    if (pattern.test(name)) {
      const route = base === "" ? "/" : `/${base}`;
      routes.set(route, full);
    }
  }
  return routes;
}

const pageRoutes = discoverFiles(webDir, "", /^page\.(tsx|ts|jsx|js)$/);
const apiRoutes = discoverFiles(webDir, "", /^route\.(tsx|ts|jsx|js)$/);

const app = new Hono();
app.use("*", staticHandler);

// Dynamic API routes (Next.js style: src/web/.../route.ts)
for (const [route, filePath] of apiRoutes) {
  app.all(route, async (c) => {
    const mod: any = await import(filePath);
    const handler = mod[c.req.method];
    if (typeof handler !== "function") {
      return c.json({ success: false, error: "method not allowed" }, 405);
    }
    const res = await handler(c.req.raw);
    return res instanceof Response ? res : c.json(res);
  });
}

// Dynamic page routes (Next.js style: src/web/.../page.tsx)
for (const [route, filePath] of pageRoutes) {
  app.get(route, async (c) => {
    const mod: any = await import(filePath);
    const Page = mod.default;
    const loadData = typeof mod.loadData === "function" ? mod.loadData : async () => ({});
    const clientScript = typeof mod.clientScript === "function" ? mod.clientScript : null;
    const data = await loadData();
    const pageEl = React.createElement(Page, data || {});
    const RootLayout = (await import(join(webDir, "layout.tsx"))).default;
    const title = route === "/" ? "App" : route.slice(1);
    const baseHtml = renderToString(React.createElement(RootLayout, { title, children: pageEl }));
    let html = baseHtml;
    if (clientScript) {
      const script = clientScript(data);
      html = baseHtml.replace("</body>", `${script}</body>`);
    }
    return c.html(html);
  });
}

if (!pageRoutes.has("/")) {
  app.get("/", (c) => c.redirect("/help"));
}

app.notFound((c) => c.text("Not Found", 404));

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
};