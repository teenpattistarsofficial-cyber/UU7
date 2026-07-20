import { z } from "zod";
import { siteUrl, publishToken } from "../config.js";

async function callOps(path: string, init: RequestInit = {}) {
  const res = await fetch(new URL(path, siteUrl()), {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${publishToken()}`, "Content-Type": "application/json" },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`${path} failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

export const listRedirectsSchema = {};

export async function listRedirects() {
  return callOps("/api/ops/redirects");
}

export const createRedirectSchema = {
  fromPath: z.string().describe("The broken/old path, e.g. \"/game-guides/old-slug\"."),
  toPath: z.string().describe("Where it should redirect to, e.g. \"/game-guides/new-slug\". Same-site only — an external origin gets stripped down to a bare path."),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]).optional().describe("Defaults to 308 (permanent, preserves method)."),
};

export async function createRedirect(args: { fromPath: string; toPath: string; statusCode?: number }) {
  return callOps("/api/ops/redirects", { method: "POST", body: JSON.stringify(args) });
}

export const deleteRedirectSchema = {
  id: z.string().describe("The redirect's id, from list_redirects."),
};

export async function deleteRedirect(args: { id: string }) {
  return callOps(`/api/ops/redirects/${args.id}`, { method: "DELETE" });
}
