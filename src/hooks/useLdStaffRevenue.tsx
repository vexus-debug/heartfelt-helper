import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLdStaffRevenueAllocations(periodStart?: string, periodEnd?: string) {
  return useQuery({
    queryKey: ["ld-staff-revenue-allocations", periodStart, periodEnd],
    queryFn: async () => {
      let q = supabase.from("ld_staff_revenue_allocations").select("*, staff:ld_staff(full_name, role, seniority_level)").order("created_at", { ascending: false });
      if (periodStart) q = q.gte("period_start", periodStart);
      if (periodEnd) q = q.lte("period_end", periodEnd);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateLdStaffRevenueAllocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { error } = await supabase.from("ld_staff_revenue_allocations").insert([values as any]);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ld-staff-revenue-allocations"] }); toast.success("Allocation saved"); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Calculate revenue allocation for a period
// Feature #4: 20% output uses CASE COUNT only (not revenue)
// Feature #5: Each case = 1 unit — no duplication
// Feature #6: Repeat/Remake deduction — original tech gets output % + 2× basic % penalty
export function calculateStaffRevenueAllocation(
  cases: any[],
  staff: any[],
  periodStart: Date,
  periodEnd: Date,
  paidOnly: boolean = false
) {
  // Filter cases in the period
  const periodCases = cases.filter((c: any) => {
    const d = new Date(c.created_at);
    if (d < periodStart || d > periodEnd) return false;
    if (paidOnly && !c.is_paid) return false;
    return true;
  });

  // Deduplicate: unique by case id
  const seenCaseIds = new Set<string>();
  const uniqueCases = periodCases.filter((c: any) => {
    if (seenCaseIds.has(c.id)) return false;
    seenCaseIds.add(c.id);
    return true;
  });

  // Exclude courier and express charges from allocation base
  const getProductiveAmount = (c: any) => {
    const net = Number(c.net_amount || 0);
    const courier = Number(c.courier_amount || 0);
    const express = Number(c.express_surcharge || 0);
    return Math.max(net - courier - express, 0);
  };

  const totalProductiveRevenue = uniqueCases.reduce((s, c) => s + getProductiveAmount(c), 0);
  const outputPool = totalProductiveRevenue * 0.20; // 20% output
  const basicPool = totalProductiveRevenue * 0.10; // 10% basic

  // Count jobs per technician — CASE COUNT ONLY (Feature #4)
  const techJobs: Record<string, { count: number; revenue: number }> = {};
  uniqueCases.forEach(c => {
    const tid = c.assigned_technician_id;
    if (!tid) return;
    if (!techJobs[tid]) techJobs[tid] = { count: 0, revenue: 0 };
    techJobs[tid].count++;
    techJobs[tid].revenue += getProductiveAmount(c);
  });

  const totalJobs = Object.values(techJobs).reduce((s, t) => s + t.count, 0);

  // Find repeat/remake cases and calculate deductions for original technicians
  // Deduction = output % share + 2× basic salary % share for each repeat case
  const repeatCases = uniqueCases.filter((c: any) =>
    (c.remark === "Repeat" || c.remark === "Remake") && c.original_technician_id
  );

  // Also find repeat cases from ALL cases (not just this period) that reference original cases in this period
  const allRepeatCases = cases.filter((c: any) =>
    (c.remark === "Repeat" || c.remark === "Remake") && c.original_technician_id
  );

  // Calculate deductions per original technician
  const techDeductions: Record<string, { count: number; amount: number }> = {};
  allRepeatCases.forEach((rc: any) => {
    const origTechId = rc.original_technician_id;
    if (!origTechId) return;
    if (!techDeductions[origTechId]) techDeductions[origTechId] = { count: 0, amount: 0 };
    techDeductions[origTechId].count++;
  });

  // Bonus re-assignments tracking
  const bonusReassignments: Record<string, string[]> = {};
  uniqueCases.forEach((c: any) => {
    if (c.bonus_reassignment_tech_id) {
      if (!bonusReassignments[c.bonus_reassignment_tech_id]) bonusReassignments[c.bonus_reassignment_tech_id] = [];
      bonusReassignments[c.bonus_reassignment_tech_id].push(c.case_number);
    }
  });

  // Calculate seniority total for basic salary distribution
  const activeStaff = staff.filter((s: any) => s.status === "active" && techJobs[s.id]);
  const totalSeniority = activeStaff.reduce((s, st) => s + (Number(st.seniority_level) || 1), 0);

  const allocations = activeStaff.map(st => {
    const jobs = techJobs[st.id] || { count: 0, revenue: 0 };
    
    // Output: proportional to CASE COUNT (not revenue) — Feature #4
    const outputShare = totalJobs > 0 ? (jobs.count / totalJobs) * outputPool : 0;
    
    // Basic: proportional to seniority level
    const seniorityLevel = Number(st.seniority_level) || 1;
    const basicShare = totalSeniority > 0 ? (seniorityLevel / totalSeniority) * basicPool : 0;

    // Repeat penalty: deduct output share + 2× basic share for each repeat case
    const deduction = techDeductions[st.id] || { count: 0, amount: 0 };
    let repeatPenalty = 0;
    if (deduction.count > 0 && totalJobs > 0) {
      const perCaseOutput = outputPool / totalJobs;
      const perCaseBasic = totalSeniority > 0 ? (seniorityLevel / totalSeniority) * basicPool / Math.max(jobs.count, 1) : 0;
      repeatPenalty = deduction.count * (perCaseOutput + 2 * perCaseBasic);
    }

    const grossAllocation = outputShare + basicShare;
    const netAllocation = Math.max(grossAllocation - repeatPenalty, 0);

    return {
      staff_id: st.id,
      staff_name: st.full_name,
      role: st.role,
      seniority_level: seniorityLevel,
      jobs_count: jobs.count,
      jobs_revenue: jobs.revenue,
      output_allocation: Math.round(outputShare * 100) / 100,
      basic_allocation: Math.round(basicShare * 100) / 100,
      repeat_penalty: Math.round(repeatPenalty * 100) / 100,
      repeat_count: deduction.count,
      bonus_reassignments: bonusReassignments[st.id] || [],
      total_allocation: Math.round(netAllocation * 100) / 100,
    };
  });

  return {
    totalProductiveRevenue,
    outputPool,
    basicPool,
    totalJobs,
    allocations,
    repeatCasesCount: allRepeatCases.length,
    courierTotal: uniqueCases.reduce((s, c) => s + Number(c.courier_amount || 0), 0),
    expressTotal: uniqueCases.reduce((s, c) => s + Number(c.express_surcharge || 0), 0),
  };
}
