import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { Buffer } from "node:buffer";
import type { Connect, Plugin } from "vite";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

async function readJsonBody(req: Connect.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    if (typeof chunk === "string") {
      chunks.push(Buffer.from(chunk));
    } else {
      chunks.push(chunk as Buffer);
    }
  }
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function jiraProxyMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const incomingPath = typeof req.url === "string" ? req.url : "/";
    const incomingUrl = new URL(incomingPath, "http://localhost");
    const pathname = incomingUrl.pathname;
    if (!pathname.startsWith("/api/jira/")) return next();

    try {
      const route =
        pathname === "/api/jira/search-jql"
          ? { allowedMethod: "POST", jiraMethod: "POST", jiraPath: "/rest/api/3/search/jql" }
          : pathname === "/api/jira/issue"
            ? { allowedMethod: "POST", jiraMethod: "POST", jiraPath: "/rest/api/3/issue" }
            : pathname.startsWith("/api/jira/issue/")
              ? (() => {
                  const issueKey = decodeURIComponent(
                    pathname.slice("/api/jira/issue/".length),
                  ).trim();
                  if (!issueKey) return null;
                  const suffix = incomingUrl.search || "";
                  if (req.method === "POST") {
                    return {
                      allowedMethod: "POST",
                      jiraMethod: "GET",
                      jiraPath: `/rest/api/3/issue/${encodeURIComponent(issueKey)}${suffix}`,
                    };
                  }
                  if (req.method === "PUT") {
                    return {
                      allowedMethod: "PUT",
                      jiraMethod: "PUT",
                      jiraPath: `/rest/api/3/issue/${encodeURIComponent(issueKey)}`,
                    };
                  }
                  return null;
                })()
              : null;

      if (!route) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Unknown Jira proxy endpoint" }));
        return;
      }

      if (req.method !== route.allowedMethod) {
        res.statusCode = 405;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Method not allowed" }));
        return;
      }

      const parsed = await readJsonBody(req);
      if (!isRecord(parsed)) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
        return;
      }

      const baseUrl = typeof parsed.baseUrl === "string" ? parsed.baseUrl : "";
      const email = typeof parsed.email === "string" ? parsed.email : "";
      const apiToken = typeof parsed.apiToken === "string" ? parsed.apiToken : "";
      const requestBody = isRecord(parsed.request) ? parsed.request : null;

      const requireRequestBody =
        route.jiraMethod === "POST" || route.jiraMethod === "PUT";

      if (
        !baseUrl ||
        !email ||
        !apiToken ||
        (requireRequestBody && !requestBody)
      ) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error:
              "Missing required fields: baseUrl, email, apiToken, request",
          }),
        );
        return;
      }

      const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
      const jiraUrl = `${normalizeBaseUrl(baseUrl)}${route.jiraPath}`;

      const jiraResponse = await fetch(jiraUrl, {
        method: route.jiraMethod,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body:
          requireRequestBody && requestBody
            ? JSON.stringify(requestBody)
            : undefined,
      });

      const responseText = await jiraResponse.text();
      res.statusCode = jiraResponse.status;
      res.setHeader(
        "Content-Type",
        jiraResponse.headers.get("content-type") ?? "application/json",
      );
      res.end(responseText);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: `Jira proxy error: ${message}` }));
    }
  };
}

function jiraProxyPlugin(): Plugin {
  const middleware = jiraProxyMiddleware();
  return {
    name: "jira-search-jql-proxy",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    jiraProxyPlugin(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
