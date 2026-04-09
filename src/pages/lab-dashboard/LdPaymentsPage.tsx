import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { useLdPayments, useCreateLdPayment, useLdInvoices, useLdClients } from "@/hooks/useLabDashboard";
import { format } from "date-fns";

export default function LdPaymentsPage() {
  const { data: payments = [], isLoading } = useLdPayments();
  const { data: invoices = [] } = useLdInvoices();
  const { data: clients = [] } = useLdClients();
  const createPayment = useCreateLdPayment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [noInvoice, setNoInvoice] = useState(false);

  // Filter unpaid invoices and optionally by selected client
  const unpaidInvoices = useMemo(() => {
    return invoices.filter((i: any) => {
      const isUnpaid = i.status !== "paid";
      const matchClient = selectedClientId === "all" || i.client_id === selectedClientId;
      return isUnpaid && matchClient;
    });
  }, [invoices, selectedClientId]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const invoiceId = noInvoice ? null : (fd.get("invoice_id") as string);
    if (!noInvoice && !invoiceId) return;
    const values: Record<string, unknown> = {
      amount: Number(fd.get("amount") || 0),
      payment_method: fd.get("payment_method") as string,
      payment_date: (fd.get("payment_date") as string) || new Date().toISOString().split("T")[0],
      reference: fd.get("reference") as string,
      remark: fd.get("remark") as string,
    };
    if (invoiceId) values.invoice_id = invoiceId;
    if (noInvoice && selectedClientId !== "all") values.client_id = selectedClientId;
    createPayment.mutate(values, { onSuccess: () => { setDialogOpen(false); setSelectedClientId("all"); setNoInvoice(false); } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">Impression n Teeth — Payment tracking</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setSelectedClientId("all"); setNoInvoice(false); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Record Payment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Step 1: Optionally filter by client */}
              <div>
                <Label>Step 1: Filter by Clinic / Client (optional)</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger><SelectValue placeholder="All clients" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.clinic_code ? `[${c.clinic_code}] ` : ""}{c.clinic_name} — {c.doctor_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-0.5">Narrow down the invoice list by selecting a client first</p>
              </div>

              {/* Step 2: Select the invoice to allocate payment */}
              <div>
                <Label>Step 2: Select Invoice to Pay</Label>
                <div className="flex items-center gap-2 my-1.5">
                  <Checkbox id="no-invoice" checked={noInvoice} onCheckedChange={(v) => setNoInvoice(!!v)} />
                  <label htmlFor="no-invoice" className="text-sm text-muted-foreground cursor-pointer">Record payment without an invoice</label>
                </div>
                {!noInvoice && (
                  <>
                    <select name="invoice_id" required className="w-full border rounded-md p-2 text-sm bg-background">
                      <option value="">— Choose an unpaid invoice —</option>
                      {unpaidInvoices.length === 0 && <option disabled>No unpaid invoices{selectedClientId !== "all" ? " for this client" : ""}</option>}
                      {unpaidInvoices.map((i: any) => (
                        <option key={i.id} value={i.id}>
                          {i.invoice_number} — {i.client?.clinic_name || i.patient_name || "Unknown"} — ₦{Number(i.total_amount - i.amount_paid).toLocaleString()} outstanding
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground mt-0.5">This payment will be allocated against the selected invoice</p>
                  </>
                )}
                {noInvoice && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Payment will be recorded without linking to any invoice</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Amount (₦) *</Label>
                  <Input name="amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label>Method</Label>
                  <select name="payment_method" className="w-full border rounded-md p-2 text-sm bg-background">
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                    <option value="card">Card</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Payment Date *</Label>
                  <Input name="payment_date" type="date" required defaultValue={new Date().toISOString().split("T")[0]} />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Editable — backdate if needed</p>
                </div>
                <div>
                  <Label>Reference</Label>
                  <Input name="reference" />
                </div>
              </div>
              <div>
                <Label>Remark</Label>
                <Textarea name="remark" placeholder='e.g. "Payment actually received April 15"' rows={2} />
              </div>
              <Button type="submit" className="w-full" disabled={createPayment.isPending}>Record Payment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Invoice</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Payment Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Recorded</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Reference</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Remark</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : !payments.length ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No payments recorded</td></tr>
                ) : payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="p-3 font-mono text-xs">{p.invoice?.invoice_number || "—"}</td>
                    <td className="p-3 text-xs">{format(new Date(p.payment_date), "MMM d, yyyy")}</td>
                    <td className="p-3 text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</td>
                    <td className="p-3 text-right font-medium">₦{Number(p.amount).toLocaleString()}</td>
                    <td className="p-3 capitalize">{p.payment_method}</td>
                    <td className="p-3 text-xs">{p.reference || "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">{p.remark || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
