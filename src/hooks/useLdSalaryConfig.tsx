import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useLdSalaryConfigs() {
  return useQuery({
    queryKey: ["ld-salary-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ld_salary_config")
        .select("*, staff:ld_staff(id, full_name, role, status)")
        .order("created_at");
      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateLdSalaryConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (configs: { id: string; basic_percentage: number; output_percentage: number }[]) => {
      for (const c of configs) {
        const { error } = await supabase
          .from("ld_salary_config")
          .update({ basic_percentage: c.basic_percentage, output_percentage: c.output_percentage })
          .eq("id", c.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ld-salary-configs"] });
      toast.success("Salary percentages updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useLdSalaryDeductions(periodStart?: string, periodEnd?: string) {
  return useQuery({
    queryKey: ["ld-salary-deductions", periodStart, periodEnd],
    queryFn: async () => {
      let q = supabase
        .from("ld_salary_deductions")
        .select("*, staff:ld_staff(id, full_name)")
        .order("created_at", { ascending: false });
      if (periodStart) q = q.gte("period_start", periodStart);
      if (periodEnd) q = q.lte("period_end", periodEnd);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateLdSalaryDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: {
      staff_id: string;
      period_start: string;
      period_end: string;
      deduction_type: string;
      amount: number;
      notes?: string;
    }) => {
      const { error } = await supabase.from("ld_salary_deductions").insert([values]);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ld-salary-deductions"] });
      toast.success("Deduction added");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLdSalaryDeduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ld_salary_deductions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ld-salary-deductions"] });
      toast.success("Deduction removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
