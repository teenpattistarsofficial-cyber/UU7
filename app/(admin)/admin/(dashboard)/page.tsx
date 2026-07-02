import { db } from "@/lib/db";
import { posts, pages, categories, authors } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [postCount, pageCount, categoryCount, authorCount] = await Promise.all([
    db.$count(posts),
    db.$count(pages),
    db.$count(categories),
    db.$count(authors),
  ]);

  const stats = [
    { label: "Posts", value: postCount },
    { label: "Pages", value: pageCount },
    { label: "Categories", value: categoryCount },
    { label: "Authors", value: authorCount },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
