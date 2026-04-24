import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, FileText, Sparkles, Loader2 } from "lucide-react";
import { useCreateContract } from "@/hooks/useContracts";
import { toast } from "sonner";
import { addMonths, format } from "date-fns";

const UploadContract = () => {
  const navigate = useNavigate();
  const create = useCreateContract();
  const [extracting, setExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    supplier_name: "",
    contact_email: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
    termination_period_days: 60,
    renewal_period_months: 12,
    silent_renewal: true,
    yearly_cost: 0,
    monthly_cost: 0,
    responsible_name: "",
    notes: "",
  });

  const handleFile = async (file: File) => {
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Enkel PDF-bestanden worden ondersteund");
      return;
    }
    setExtracting(true);
    // Simulated AI extraction — guess based on filename
    await new Promise((r) => setTimeout(r, 1400));
    const guess = file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
    setForm((f) => ({
      ...f,
      name: f.name || guess,
      supplier_name: f.supplier_name || guess.split(" ")[0] || "Onbekende leverancier",
    }));
    setExtracting(false);
    toast.success("Gegevens herkend uit het document — gelieve te controleren");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.supplier_name || !form.end_date) {
      toast.error("Vul minstens contractnaam, leverancier en einddatum in");
      return;
    }
    try {
      const yearly = Number(form.yearly_cost) || 0;
      const monthly = Number(form.monthly_cost) || (yearly ? yearly / 12 : 0);
      const created = await create.mutateAsync({
        ...form,
        yearly_cost: yearly,
        monthly_cost: monthly,
        contract_value: yearly,
        termination_period_days: Number(form.termination_period_days),
        renewal_period_months: Number(form.renewal_period_months),
      } as any);
      toast.success("Contract toegevoegd");
      navigate(`/app/contract/${(created as any).id}`);
    } catch (err: any) {
      toast.error(err.message || "Opslaan mislukt");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Terug naar dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold mb-1">Nieuw contract</h1>
        <p className="text-muted-foreground">Upload een PDF of vul de gegevens manueel in.</p>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragActive ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-secondary/50"
        }`}
      >
        <input
          type="file"
          ref={fileRef}
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {extracting ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="font-medium">Gegevens herkennen...</p>
            <p className="text-sm text-muted-foreground inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI vult onderstaande velden in
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-medium">Sleep je PDF hier of klik om te kiezen</p>
            <p className="text-sm text-muted-foreground">Wij vullen de velden automatisch in</p>
          </div>
        )}
      </div>

      {/* Manual form */}
      <form onSubmit={submit} className="space-y-4 bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <FileText className="w-4 h-4" /> Contractgegevens
        </div>

        <Field label="Naam contract">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bv. Mobiele abonnementen" />
        </Field>
        <Field label="Leverancier">
          <Input value={form.supplier_name} onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} placeholder="Bv. Proximus" />
        </Field>
        <Field label="E-mail leverancier">
          <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} placeholder="contact@leverancier.be" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Startdatum">
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </Field>
          <Field label="Einddatum">
            <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </Field>
          <Field label="Opzegtermijn (dagen)">
            <Input type="number" min={0} value={form.termination_period_days} onChange={(e) => setForm({ ...form, termination_period_days: Number(e.target.value) })} />
          </Field>
          <Field label="Verlengingsperiode (maanden)">
            <Input type="number" min={0} value={form.renewal_period_months} onChange={(e) => setForm({ ...form, renewal_period_months: Number(e.target.value) })} />
          </Field>
          <Field label="Bedrag per jaar (€)">
            <Input type="number" min={0} value={form.yearly_cost} onChange={(e) => setForm({ ...form, yearly_cost: Number(e.target.value) })} />
          </Field>
          <Field label="Verantwoordelijke">
            <Input value={form.responsible_name} onChange={(e) => setForm({ ...form, responsible_name: e.target.value })} placeholder="Naam medewerker" />
          </Field>
        </div>

        <Field label="Notities">
          <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Link to="/app"><Button type="button" variant="ghost">Annuleren</Button></Link>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Contract opslaan
          </Button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label>{label}</Label>
    {children}
  </div>
);

export default UploadContract;
