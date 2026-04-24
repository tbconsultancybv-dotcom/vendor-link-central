import { differenceInDays, addDays, format } from "date-fns";
import { nl } from "date-fns/locale";

export type Contract = {
  id: string;
  name: string;
  supplier_name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  termination_period_days: number | null;
  silent_renewal: boolean | null;
  renewal_period_months: number | null;
  monthly_cost: number | null;
  yearly_cost: number | null;
  contract_value: number | null;
  contact_email: string | null;
  responsible_name: string | null;
  open_to_offers: string | null;
  user_decision: string | null;
  decision_at: string | null;
  notes: string | null;
};

export type Urgency = "urgent" | "soon" | "later" | "expired";

/**
 * Action deadline = end_date - termination_period_days.
 * After this date, silent renewal kicks in.
 */
export function getActionDeadline(contract: Pick<Contract, "end_date" | "termination_period_days">): Date {
  const end = new Date(contract.end_date);
  const days = contract.termination_period_days ?? 0;
  return addDays(end, -days);
}

export function daysUntilAction(contract: Pick<Contract, "end_date" | "termination_period_days">): number {
  return differenceInDays(getActionDeadline(contract), new Date());
}

export function getUrgency(contract: Pick<Contract, "end_date" | "termination_period_days">): Urgency {
  const days = daysUntilAction(contract);
  if (days < 0) return "expired";
  if (days <= 30) return "urgent";
  if (days <= 90) return "soon";
  return "later";
}

export function urgencyLabel(u: Urgency): string {
  switch (u) {
    case "urgent": return "Urgent";
    case "soon": return "Binnenkort";
    case "later": return "OK";
    case "expired": return "Verlopen";
  }
}

export function urgencyColor(u: Urgency): string {
  switch (u) {
    case "urgent": return "bg-destructive text-destructive-foreground";
    case "soon": return "bg-warning text-warning-foreground";
    case "later": return "bg-success text-success-foreground";
    case "expired": return "bg-muted text-muted-foreground";
  }
}

export function formatDate(d: string | Date): string {
  return format(new Date(d), "d MMMM yyyy", { locale: nl });
}

export function formatDateShort(d: string | Date): string {
  return format(new Date(d), "d MMM", { locale: nl });
}

export function formatEuro(n: number | null | undefined): string {
  return `€${(n ?? 0).toLocaleString("nl-NL", { maximumFractionDigits: 0 })}`;
}

export function shortStatusText(c: Contract): string {
  const urgency = getUrgency(c);
  const deadline = getActionDeadline(c);
  if (urgency === "expired") return `Verlopen op ${formatDate(c.end_date)}`;
  return `Opzeggen vóór ${formatDate(deadline)}`;
}

export function buildCancellationEmail(c: Contract, fromName: string): { subject: string; body: string } {
  const deadline = getActionDeadline(c);
  const subject = `Opzegging contract: ${c.name}`;
  const body = `Beste ${c.supplier_name},

Hierbij wens ik het contract "${c.name}" op te zeggen per einddatum ${formatDate(c.end_date)}.

Deze opzegging wordt verstuurd binnen de geldende opzegtermijn van ${c.termination_period_days ?? 0} dagen (uiterlijk ${formatDate(deadline)}).

Gelieve deze opzegging schriftelijk te bevestigen.

Met vriendelijke groet,
${fromName}`;
  return { subject, body };
}
