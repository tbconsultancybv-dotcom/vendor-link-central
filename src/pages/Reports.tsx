import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContracts, useCategories } from "@/hooks/useContracts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useState, useMemo } from "react";

const ReportsPage = () => {
  const { contracts, isLoading } = useContracts();
  const { data: categories = [] } = useCategories();
  const [timeRange, setTimeRange] = useState("year");

  // Calculate statistics
  const stats = useMemo(() => {
    if (!contracts.length) return null;

    const totalMonthly = contracts.reduce((sum, c) => sum + c.monthly_cost, 0);
    const totalYearly = contracts.reduce((sum, c) => sum + c.yearly_cost, 0);
    const activeContracts = contracts.filter((c) => c.status === "active").length;
    const expiringContracts = contracts.filter((c) => c.status === "expiring").length;

    // Category breakdown
    const categoryBreakdown = categories.map((cat) => {
      const categoryContracts = contracts.filter((c) => c.category_id === cat.id);
      const monthlyCost = categoryContracts.reduce((sum, c) => sum + c.monthly_cost, 0);
      return {
        name: cat.name,
        value: monthlyCost,
        count: categoryContracts.length,
        color: cat.color,
      };
    }).filter((c) => c.value > 0);

    // Supplier breakdown
    const supplierCosts = contracts.reduce((acc, c) => {
      acc[c.supplier_name] = (acc[c.supplier_name] || 0) + c.monthly_cost;
      return acc;
    }, {} as Record<string, number>);

    const topSuppliers = Object.entries(supplierCosts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, cost]) => ({ name, cost }));

    // Monthly trend (mock data based on current costs)
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const monthlyTrend = months.slice(0, currentMonth + 1).map((month, i) => {
      const variation = 0.9 + Math.random() * 0.2;
      return {
        month,
        kosten: Math.round(totalMonthly * variation),
      };
    });

    return {
      totalMonthly,
      totalYearly,
      activeContracts,
      expiringContracts,
      categoryBreakdown,
      topSuppliers,
      monthlyTrend,
    };
  }, [contracts, categories]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <DashboardHeader
          title="Rapportages"
          subtitle="Inzicht in je contractkosten en trends"
        />

        <div className="p-6">
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Deze maand</SelectItem>
                  <SelectItem value="quarter">Dit kwartaal</SelectItem>
                  <SelectItem value="year">Dit jaar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading || !stats ? (
            <div className="text-center py-12 text-muted-foreground">
              Gegevens laden...
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Maandelijkse kosten</p>
                        <p className="text-2xl font-bold">
                          €{stats.totalMonthly.toLocaleString("nl-NL")}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Euro className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Jaarlijkse kosten</p>
                        <p className="text-2xl font-bold">
                          €{stats.totalYearly.toLocaleString("nl-NL")}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-success" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Actieve contracten</p>
                        <p className="text-2xl font-bold">{stats.activeContracts}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Verloopt binnenkort</p>
                        <p className="text-2xl font-bold">{stats.expiringContracts}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                        <TrendingDown className="w-5 h-5 text-warning" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Monthly Trend */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <CardTitle>Kostenverloop</CardTitle>
                    </div>
                    <CardDescription>Maandelijkse kosten dit jaar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={stats.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="month" className="text-muted-foreground" />
                        <YAxis className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`€${value.toLocaleString("nl-NL")}`, "Kosten"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="kosten"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category Breakdown Pie */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-primary" />
                      <CardTitle>Kosten per categorie</CardTitle>
                    </div>
                    <CardDescription>Verdeling maandelijkse kosten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.categoryBreakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {stats.categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`€${value.toLocaleString("nl-NL")}`, "Kosten"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Suppliers Bar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Leveranciers</CardTitle>
                    <CardDescription>Hoogste maandelijkse kosten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.topSuppliers} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-muted-foreground" />
                        <YAxis dataKey="name" type="category" width={120} className="text-muted-foreground" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`€${value.toLocaleString("nl-NL")}`, "Kosten"]}
                        />
                        <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Category List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overzicht per categorie</CardTitle>
                    <CardDescription>Aantal contracten en kosten</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.categoryBreakdown.map((cat, index) => (
                        <div
                          key={cat.name}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color || COLORS[index % COLORS.length] }}
                            />
                            <div>
                              <p className="font-medium">{cat.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cat.count} contract{cat.count !== 1 ? "en" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              €{cat.value.toLocaleString("nl-NL")}
                            </p>
                            <p className="text-sm text-muted-foreground">/maand</p>
                          </div>
                        </div>
                      ))}

                      {stats.categoryBreakdown.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          Voeg contracten toe met een categorie om statistieken te zien
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
