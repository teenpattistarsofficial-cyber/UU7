import "server-only";
import { searchconsole, auth as googleAuth } from "@googleapis/searchconsole";
import { getGoogleCredentials } from "@/lib/analytics/config";

export type SearchQueryRow = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

/** Search Console's own row cap per query is 25,000 — well above what one
 * site-day of queries needs, so a single unpaginated request is sufficient. */
const ROW_LIMIT = 5000;

export async function fetchSearchQueries(siteUrl: string, startDate: string, endDate: string): Promise<SearchQueryRow[]> {
  const authClient = new googleAuth.GoogleAuth({
    credentials: getGoogleCredentials(),
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });

  const client = searchconsole({ version: "v1", auth: authClient });
  const res = await client.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query", "page"],
      rowLimit: ROW_LIMIT,
    },
  });

  return (res.data.rows ?? []).map((row) => ({
    query: row.keys?.[0] ?? "",
    page: row.keys?.[1] ?? "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}
