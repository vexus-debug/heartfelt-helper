import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useLdCases, useLdStaff } from "@/hooks/useLabDashboard";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, CheckCircle, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

function computePerformance(cases: any[], technicians: any[], dateStart: Date, dateEnd: Date) {
  const periodCases = cases.filter((c: any) => {
    const d = new Date(c.created_at);
    return d >= dateStart && d <= dateEnd;
  });

  // Count repeat cases where this tech was the original (penalty tracking)
  const allRepeatCases = cases.filter((c: any) =>
    (c.remark === "Repeat" || c.remark === "Remake") && c.original_technician_id
  );

  return technicians.map((tech: any) => {
    const techCases = periodCases.filter((c: any) => c.assigned_technician_id === tech.id);
    const total = techCases.length;
    const fullyCompleted = techCases.filter((c: any) => ["ready", "delivered"].includes(c.status) && (c.completion_type === "full" || !c.completion_type)).length;
    const partiallyCompleted = techCases.filter((c: any) => ["ready", "delivered"].includes(c.status) && c.completion_type === "partial").length;
    const completed = fullyCompleted + partiallyCompleted;
    const inProgress = techCases.filter((c: any) => c.status === "in-progress").length;
    const pending = techCases.filter((c: any) => c.status === "pending").length;
    const rejected = techCases.filter((c: any) => c.remark && ["Rejected", "Damaged", "Suspended"].includes(c.remark)).length;
    const repeatCount = techCases.filter((c: any) => c.remark === "Repeat" || c.remark === "Remake").length;
    const overdue = techCases.filter((c: any) => c.due_date && new Date(c.due_date) < new Date() && !["delivered", "ready"].includes(c.status)).length;
    const urgent = techCases.filter((c: any) => c.is_urgent && !["delivered"].includes(c.status)).length;

    // Count repeat penalties (cases where this tech was the ORIGINAL tech who caused the repeat)
    const repeatPenalties = allRepeatCases.filter((c: any) => c.original_technician_id === tech.id).length;

    // Bonus re-assignments received by this tech
    const bonusReassignments = periodCases.filter((c: any) => c.bonus_reassignment_tech_id === tech.id);

    const fullRevenue = techCases
      .filter((c: any) => ["ready", "delivered"].includes(c.status) && (c.completion_type === "full" || !c.completion_type))
      .reduce((s: number, c: any) => s + Number(c.net_amount || 0), 0);
    const partialRevenue = techCases
      .filter((c: any) => ["ready", "delivered"].includes(c.status) && c.completion_type === "partial")
      .reduce((s: number, c: any) => s + Number(c.net_amount || 0) * 0.5, 0);
    const totalRevenue = fullRevenue + partialRevenue;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    const completedWithDates = techCases.filter((c: any) => c.received_date && c.completed_date);
    const avgTurnaround = completedWithDates.length > 0
      ? Math.round(completedWithDates.reduce((s: number, c: any) => {
          const start = new Date(c.received_date).getTime();
          const end = new Date(c.completed_date).getTime();
          return s + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / completedWithDates.length)
      : 0;

    return {
      id: tech.id, name: tech.full_name, role: tech.role, specialty: tech.specialty,
      total, completed, fullyCompleted, partiallyCompleted, inProgress, pending, rejected, repeatCount, repeatPenalties, overdue, urgent,
      completionRate, rejectionRate, avgTurnaround, totalRevenue,
      bonusReassignmentCount: bonusReassignments.length,
    };
  }).sort((a, b) => b.total - a.total);
}

function PerformanceCards({ data }: { data: ReturnType<typeof computePerformance> }) {
  const navigate = useNavigate();
  const topPerformer = data.reduce((best, t) => t.completionRate > (best?.completionRate || 0) ? t : best, data[0]);
  const chartData = data.map(t => ({
    name: t.name.split(" ")[0],
    "Fully Completed": t.fullyCompleted,
    "Partially Completed": t.partiallyCompleted,
    "In Progress": t.inProgress,
    Pending: t.pending,
    Rejected: t.rejected,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Active Techs</p><p className="text-xl font-bold">{data.length}</p></div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="h-5 w-5 text-emerald-500" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Fully Completed</p><p className="text-xl font-bold">{data.reduce((s, t) => s + t.fullyCompleted, 0)}</p></div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Clock className="h-5 w-5 text-amber-500" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Partially Completed</p><p className="text-xl font-bold">{data.reduce((s, t) => s + t.partiallyCompleted, 0)}</p></div>
        </CardContent></Card>
        <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-blue-500" /></div>
          <div><p className="text-[10px] text-muted-foreground uppercase">Top Performer</p><p className="text-sm font-bold truncate">{topPerformer?.name || "—"}</p></div>
        </CardContent></Card>
      </div>

      {chartData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base">Workload Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="Fully Completed" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="Partially Completed" fill="#f59e0b" radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="In Progress" fill="#3b82f6" radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="Pending" fill="#94a3b8" radius={[2, 2, 0, 0]} stackId="stack" />
                <Bar dataKey="Rejected" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="stack" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {data.map((tech, i) => (
          <motion.div key={tech.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base">{tech.name}</h3>
                    <div className="flex gap-2 mt-1">
                      {tech.specialty && <Badge variant="outline" className="text-[10px]">{tech.specialty}</Badge>}
                      <Badge variant="secondary" className="text-[10px]">{tech.role}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                      title="Click to view assigned cases"
                      onClick={() => navigate(`/lab-dashboard/cases?tech=${tech.id}`)}
                    >
                      {tech.total}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Total Cases</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">{tech.completionRate}%</span>
                    </div>
                    <Progress value={tech.completionRate} className="h-2" />
                  </div>
                  <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-border/30">
                    <div><p className="text-sm font-semibold text-emerald-600">{tech.fullyCompleted}</p><p className="text-[9px] text-muted-foreground">Full</p></div>
                    <div><p className="text-sm font-semibold text-amber-500">{tech.partiallyCompleted}</p><p className="text-[9px] text-muted-foreground">Partial</p></div>
                    <div><p className="text-sm font-semibold text-blue-500">{tech.inProgress}</p><p className="text-[9px] text-muted-foreground">In Prog</p></div>
                    <div><p className="text-sm font-semibold text-destructive">{tech.rejected}</p><p className="text-[9px] text-muted-foreground">Rejected</p></div>
                    <div><p className="text-sm font-semibold text-amber-500">{tech.overdue}</p><p className="text-[9px] text-muted-foreground">Overdue</p></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30 text-xs">
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-muted-foreground" /><span>Avg: {tech.avgTurnaround}d</span></div>
                    <div className="flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-destructive" /><span>Reject: {tech.rejectionRate}%</span></div>
                    <div className="text-right"><span className="font-medium">₦{tech.totalRevenue.toLocaleString()}</span><p className="text-[9px] text-muted-foreground">Salary value</p></div>
                  </div>
                  {tech.repeatCount > 0 && (
                    <div className="text-[10px] p-2 rounded bg-amber-500/10 text-amber-700">
                      🔁 {tech.repeatCount} repeat/remake case(s) assigned to this tech
                    </div>
                  )}
                  {tech.repeatPenalties > 0 && (
                    <div className="text-[10px] p-2 rounded bg-destructive/10 text-destructive">
                      ⚠ {tech.repeatPenalties} repeat penalty deduction(s) — output % + 2× basic % deducted per case
                    </div>
                  )}
                  {tech.bonusReassignmentCount > 0 && (
                    <div className="text-[10px] p-2 rounded bg-blue-500/10 text-blue-700">
                      🎯 {tech.bonusReassignmentCount} bonus job re-assignment(s) received
                    </div>
                  )}
                  {tech.partiallyCompleted > 0 && (
                    <div className="text-[10px] p-2 rounded bg-amber-500/10 text-amber-700">
                      ⚠ {tech.partiallyCompleted} partially completed case(s) — value halved for salary calculation
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {data.length === 0 && (
          <div className="col-span-2 text-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active technicians found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LdTechPerformancePage() {
  const { data: cases = [] } = useLdCases();
  const { data: staff = [] } = useLdStaff();
  const { roles, user } = useAuth();
  const isAdmin = roles.includes("admin");

  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());

  // For non-admin, filter to only show their own performance
  const technicians = useMemo(() => {
    const active = staff.filter((s: any) => s.status === "active");
    if (isAdmin) return active;
    // Find ld_staff linked to current user
    const myStaff = active.filter((s: any) => s.user_id === user?.id);
    return myStaff.length > 0 ? myStaff : active; // fallback to all if not linked yet
  }, [staff, isAdmin, user?.id]);

  const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
  const monthEnd = endOfMonth(monthStart);
  const yearStart = startOfYear(new Date(Number(fiscalYear), 0));
  const yearEnd = endOfYear(yearStart);

  const monthlyData = useMemo(() => computePerformance(cases, technicians, monthStart, monthEnd), [cases, technicians, monthStart, monthEnd]);
  const fiscalData = useMemo(() => computePerformance(cases, technicians, yearStart, yearEnd), [cases, technicians, yearStart, yearEnd]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Technician Performance" : "My Performance"}
        description={isAdmin ? "Output rates, completion types, and salary-relevant metrics" : "Your output rates and performance metrics"}
      />

      <Tabs defaultValue="monthly" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="fiscal">Fiscal Year</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-[160px]" />
            <Select value={fiscalYear} onValueChange={setFiscalYear}>
              <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="monthly">
          <h2 className="text-lg font-semibold mb-4">{format(monthStart, "MMMM yyyy")}</h2>
          <PerformanceCards data={monthlyData} />
        </TabsContent>
        <TabsContent value="fiscal">
          <h2 className="text-lg font-semibold mb-4">Fiscal Year {fiscalYear}</h2>
          <PerformanceCards data={fiscalData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
