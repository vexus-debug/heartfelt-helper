import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useLdCases, useLdStaff } from "@/hooks/useLabDashboard";
import { useLdSalaryConfigs, useUpdateLdSalaryConfig, useLdSalaryDeductions, useCreateLdSalaryDeduction, useDeleteLdSalaryDeduction } from "@/hooks/useLdSalaryConfig";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, Settings, Trash2, Plus, Users } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { motion } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export default function LdSalaryAllocationPage() {
  const { roles, user } = useAuth();
  const isAdmin = roles.includes("admin");
  const { data: cases = [] } = useLdCases();
  const { data: staff = [] } = useLdStaff();
  const { data: salaryConfigs = [] } = useLdSalaryConfigs();
  const updateConfigs = useUpdateLdSalaryConfig();

  // Period selection
  const [periodType, setPeriodType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));

  const periodStart = useMemo(() => {
    if (periodType === "month") {
      const [y, m] = selectedMonth.split("-").map(Number);
      return startOfMonth(new Date(y, m - 1));
    }
    return startOfYear(new Date());
  }, [periodType, selectedMonth]);

  const periodEnd = useMemo(() => {
    if (periodType === "month") {
      const [y, m] = selectedMonth.split("-").map(Number);
      return endOfMonth(new Date(y, m - 1));
    }
    return endOfYear(new Date());
  }, [periodType, selectedMonth]);

  const pStart = format(periodStart, "yyyy-MM-dd");
  const pEnd = format(periodEnd, "yyyy-MM-dd");

  const { data: deductions = [] } = useLdSalaryDeductions(pStart, pEnd);
  const createDeduction = useCreateLdSalaryDeduction();
  const deleteDeduction = useDeleteLdSalaryDeduction();

  // Edit percentages dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editConfigs, setEditConfigs] = useState<{ id: string; name: string; basic_percentage: number; output_percentage: number }[]>([]);

  // Add deduction dialog
  const [deductionOpen, setDeductionOpen] = useState(false);
  const [deductionForm, setDeductionForm] = useState({ staff_id: "", deduction_type: "lateness", amount: 0, notes: "" });

  // Calculate salary allocation
  const allocation = useMemo(() => {
    const periodCases = cases.filter((c: any) => {
      const d = new Date(c.created_at);
      return d >= periodStart && d <= periodEnd;
    });

    // Deduplicate
    const seen = new Set<string>();
    const uniqueCases = periodCases.filter((c: any) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });

    // Total productive revenue (exclude courier/express)
    const getProductive = (c: any) => {
      const net = Number(c.net_amount || 0);
      const courier = Number(c.courier_amount || 0);
      const express = Number(c.express_surcharge || 0);
      return Math.max(net - courier - express, 0);
    };

    const totalProductiveRevenue = uniqueCases.reduce((s, c) => s + getProductive(c), 0);
    const basicPool = totalProductiveRevenue * 0.10;
    const outputPool = totalProductiveRevenue * 0.20;

    // Count cases per technician
    const techCases: Record<string, number> = {};
    uniqueCases.forEach((c: any) => {
      const tid = c.assigned_technician_id;
      if (!tid) return;
      techCases[tid] = (techCases[tid] || 0) + 1;
    });
    const totalCases = Object.values(techCases).reduce((s, n) => s + n, 0);

    // Build allocation per staff using fixed percentages
    const rows = salaryConfigs.map((cfg: any) => {
      const staffMember = cfg.staff;
      if (!staffMember) return null;

      const basicShare = basicPool * (cfg.basic_percentage / 100);

      // Output: use fixed output_percentage of the output pool, proportioned by case count
      // If output_percentage > 0, they share from the output pool proportionally to cases done
      const caseCount = techCases[staffMember.id] || 0;

      // Calculate output: staff's output % determines their weight among output-eligible staff
      const allOutputWeights = salaryConfigs.reduce((s: number, sc: any) => {
        const scCases = techCases[sc.staff?.id] || 0;
        if (sc.output_percentage > 0 && scCases > 0) return s + scCases;
        return s;
      }, 0);

      let outputShare = 0;
      if (cfg.output_percentage > 0 && caseCount > 0 && allOutputWeights > 0) {
        outputShare = outputPool * (caseCount / allOutputWeights);
      }

      // Deductions for this staff in this period
      const staffDeductions = deductions.filter((d: any) => d.staff_id === staffMember.id);
      const latenessTotal = staffDeductions.filter((d: any) => d.deduction_type === "lateness").reduce((s: number, d: any) => s + Number(d.amount), 0);
      const loanTotal = staffDeductions.filter((d: any) => d.deduction_type === "loan").reduce((s: number, d: any) => s + Number(d.amount), 0);

      const gross = basicShare + outputShare;
      const net = Math.max(gross - latenessTotal - loanTotal, 0);

      return {
        staffId: staffMember.id,
        name: staffMember.full_name,
        role: staffMember.role,
        basicPct: cfg.basic_percentage,
        outputPct: cfg.output_percentage,
        caseCount,
        basicSalary: basicShare,
        outputSalary: outputShare,
        lateness: latenessTotal,
        loan: loanTotal,
        total: net,
      };
    }).filter(Boolean);

    return {
      totalProductiveRevenue,
      basicPool,
      outputPool,
      totalCases,
      rows,
    };
  }, [cases, salaryConfigs, deductions, periodStart, periodEnd]);

  const openEditDialog = () => {
    setEditConfigs(salaryConfigs.map((c: any) => ({
      id: c.id,
      name: c.staff?.full_name || "Unknown",
      basic_percentage: c.basic_percentage,
      output_percentage: c.output_percentage,
    })));
    setEditOpen(true);
  };

  const saveConfigs = async () => {
    await updateConfigs.mutateAsync(editConfigs.map(c => ({
      id: c.id,
      basic_percentage: c.basic_percentage,
      output_percentage: c.output_percentage,
    })));
    setEditOpen(false);
  };

  const handleAddDeduction = async () => {
    if (!deductionForm.staff_id || deductionForm.amount <= 0) return;
    await createDeduction.mutateAsync({
      staff_id: deductionForm.staff_id,
      period_start: pStart,
      period_end: pEnd,
      deduction_type: deductionForm.deduction_type,
      amount: deductionForm.amount,
      notes: deductionForm.notes || undefined,
    });
    setDeductionForm({ staff_id: "", deduction_type: "lateness", amount: 0, notes: "" });
    setDeductionOpen(false);
  };

  // Generate month options
  const monthOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 12; i++) {
      const d = subMonths(new Date(), i);
      opts.push({ value: format(d, "yyyy-MM"), label: format(d, "MMMM yyyy") });
    }
    return opts;
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Staff Salary Allocation" description="Revenue-based salary distribution with deductions" />

      {/* Period & Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Period</Label>
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Fiscal Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {periodType === "month" && (
          <div className="space-y-1">
            <Label className="text-xs">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex gap-2 ml-auto">
          {isAdmin && (
            <>
              <Button variant="outline" size="sm" onClick={openEditDialog}>
                <Settings className="h-4 w-4 mr-1" /> Edit Percentages
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDeductionOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Deduction
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-lg font-bold">₦{fmt(allocation.totalProductiveRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Basic Pool (10%)</p>
            <p className="text-lg font-bold">₦{fmt(allocation.basicPool)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Output Pool (20%)</p>
            <p className="text-lg font-bold">₦{fmt(allocation.outputPool)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Total Cases</p>
            <p className="text-lg font-bold">{allocation.totalCases}</p>
          </CardContent>
        </Card>
      </div>

      {/* Allocation Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> Salary Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  {isAdmin && <TableHead className="text-right">Basic %</TableHead>}
                  <TableHead className="text-right">Basic Salary</TableHead>
                  <TableHead className="text-right">Output</TableHead>
                  <TableHead className="text-right">Lateness</TableHead>
                  <TableHead className="text-right">Loan</TableHead>
                  <TableHead className="text-right font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(allocation.rows || []).map((row: any) => (
                  <TableRow key={row.staffId}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{row.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{row.role?.replace("_", " ")}</p>
                      </div>
                    </TableCell>
                    {isAdmin && <TableCell className="text-right text-xs">{row.basicPct}%</TableCell>}
                    <TableCell className="text-right">₦{fmt(row.basicSalary)}</TableCell>
                    <TableCell className="text-right">₦{fmt(row.outputSalary)}</TableCell>
                    <TableCell className="text-right text-destructive">{row.lateness > 0 ? `-₦${fmt(row.lateness)}` : "—"}</TableCell>
                    <TableCell className="text-right text-destructive">{row.loan > 0 ? `-₦${fmt(row.loan)}` : "—"}</TableCell>
                    <TableCell className="text-right font-bold">₦{fmt(row.total)}</TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>TOTAL</TableCell>
                  {isAdmin && <TableCell className="text-right text-xs">100%</TableCell>}
                  <TableCell className="text-right">₦{fmt((allocation.rows || []).reduce((s: number, r: any) => s + r.basicSalary, 0))}</TableCell>
                  <TableCell className="text-right">₦{fmt((allocation.rows || []).reduce((s: number, r: any) => s + r.outputSalary, 0))}</TableCell>
                  <TableCell className="text-right text-destructive">
                    {(allocation.rows || []).reduce((s: number, r: any) => s + r.lateness, 0) > 0
                      ? `-₦${fmt((allocation.rows || []).reduce((s: number, r: any) => s + r.lateness, 0))}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right text-destructive">
                    {(allocation.rows || []).reduce((s: number, r: any) => s + r.loan, 0) > 0
                      ? `-₦${fmt((allocation.rows || []).reduce((s: number, r: any) => s + r.loan, 0))}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">₦{fmt((allocation.rows || []).reduce((s: number, r: any) => s + r.total, 0))}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Deductions List (admin only) */}
      {isAdmin && deductions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Deductions This Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deductions.map((d: any) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.staff?.full_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={d.deduction_type === "lateness" ? "destructive" : "secondary"} className="capitalize">
                          {d.deduction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₦{fmt(Number(d.amount))}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.notes || "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteDeduction.mutate(d.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Percentages Dialog (Admin only) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Salary Percentages</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {editConfigs.map((c, i) => (
              <div key={c.id} className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm font-medium truncate">{c.name}</span>
                <div className="space-y-1">
                  <Label className="text-[10px]">Basic %</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={c.basic_percentage}
                    onChange={(e) => {
                      const updated = [...editConfigs];
                      updated[i].basic_percentage = Number(e.target.value);
                      setEditConfigs(updated);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Output %</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={c.output_percentage}
                    onChange={(e) => {
                      const updated = [...editConfigs];
                      updated[i].output_percentage = Number(e.target.value);
                      setEditConfigs(updated);
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-2">
              Basic total: {editConfigs.reduce((s, c) => s + c.basic_percentage, 0).toFixed(3)}% |
              Output: only staff with output % &gt; 0 and cases done share the pool.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveConfigs} disabled={updateConfigs.isPending}>
              {updateConfigs.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Deduction Dialog (Admin only) */}
      <Dialog open={deductionOpen} onOpenChange={setDeductionOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Deduction</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Staff Member</Label>
              <Select value={deductionForm.staff_id} onValueChange={(v) => setDeductionForm({ ...deductionForm, staff_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                <SelectContent>
                  {staff.filter((s: any) => s.status === "active").map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <Select value={deductionForm.deduction_type} onValueChange={(v) => setDeductionForm({ ...deductionForm, deduction_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lateness">Lateness</SelectItem>
                  <SelectItem value="loan">Loan / Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Amount (₦)</Label>
              <Input
                type="number"
                value={deductionForm.amount || ""}
                onChange={(e) => setDeductionForm({ ...deductionForm, amount: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Input
                value={deductionForm.notes}
                onChange={(e) => setDeductionForm({ ...deductionForm, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeductionOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDeduction} disabled={createDeduction.isPending}>
              {createDeduction.isPending ? "Adding..." : "Add Deduction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
