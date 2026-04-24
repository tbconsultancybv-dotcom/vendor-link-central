import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Mail, Check } from "lucide-react";
import { toast } from "sonner";
import { Contract, buildCancellationEmail } from "@/lib/contractUtils";

interface Props {
  contract: Contract;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromName: string;
}

const CancellationDialog = ({ contract, open, onOpenChange, fromName }: Props) => {
  const initial = buildCancellationEmail(contract, fromName);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);
  const [to, setTo] = useState(contract.contact_email ?? "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`Aan: ${to}\nOnderwerp: ${subject}\n\n${body}`);
    setCopied(true);
    toast.success("Opzegmail gekopieerd naar klembord");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailto = () => {
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Opzegmail klaarzetten</DialogTitle>
          <DialogDescription>
            We hebben een opzegmail voor je voorbereid. Pas aan waar nodig en verstuur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to">Aan</Label>
            <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} placeholder="leverancier@bedrijf.be" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subj">Onderwerp</Label>
            <Input id="subj" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Bericht</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Gekopieerd" : "Kopieer"}
          </Button>
          <Button onClick={handleMailto} className="gap-2">
            <Mail className="w-4 h-4" /> Open in mailclient
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDialog;
