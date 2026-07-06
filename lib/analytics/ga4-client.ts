import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { getGoogleCredentials } from "@/lib/analytics/config";

export type DailyTraffic = {
  sessions: number;
  activeUsers: number;
  screenPageViews: number;
  avgEngagementSeconds: number;
};

const METRICS = ["sessions", "activeUsers", "screenPageViews", "averageSessionDuration"] as const;

export async function fetchDailyTraffic(propertyId: string, startDate: string, endDate: string): Promise<DailyTraffic> {
  const client = new BetaAnalyticsDataClient({ credentials: getGoogleCredentials() });

  const [response] = await client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: METRICS.map((name) => ({ name })),
  });

  const values = response.rows?.[0]?.metricValues ?? [];
  const at = (i: number) => Number(values[i]?.value ?? 0);

  return {
    sessions: at(0),
    activeUsers: at(1),
    screenPageViews: at(2),
    avgEngagementSeconds: Math.round(at(3)),
  };
}
