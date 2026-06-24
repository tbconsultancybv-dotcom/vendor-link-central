import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parse, isValid } from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Contract, ContractFormData, useCategories } from "@/hooks/useContracts";
import ContractDocuments from "./ContractDocuments";
import { Separator } from "@/components/ui/separator";

const contractSchema = z.object({
  name: z.string().min(1, "Naam is verplicht"),
  supplier_name: z.string().min(1, "Leverancier is verplicht"),
  category_id: z.string().optional(),
  description: z.string().optional(),
  start_date: z.date({ required_error: "Startdatum is verplicht" }),
  end_date: z.date({ required_error: "Einddatum is verplicht" }),
  termination_period_days: z.number().min(0).default(30),
  silent_renewal: z.boolean().default(true),
  renewal_period_months: z.number().min(1).default(12),
  monthly_cost: z.number().min(0).default(0),
  yearly_cost: z.number().min(0).default(0),
  variable_costs: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  division: z.string().optional(),
  department: z.string().optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

const DateInputField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) => {
  const [text, setText] = useState(value ? format(value, "dd-MM-yyyy") : "");

  useEffect(() => {
    setText(value ? format(value, "dd-MM-yyyy") : "");
  }, [value]);

  const commit = (raw: string) => {
    const cleaned = raw.trim();
    if (!cleaned) {
      onChange(undefined);
      return;
    }
    const formats = ["dd-MM-yyyy", "d-M-yyyy", "dd/MM/yyyy", "d/M/yyyy"];
    for (const f of formats) {
      const parsed = parse(cleaned, f, new Date());
      if (isValid(parsed)) {
        onChange(parsed);
        return;
      }
    }
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2">
        <FormControl>
          <Input
            placeholder="dd-mm-jjjj"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
          />
        </FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="shrink-0">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={(d) => onChange(d)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <FormMessage />
    </FormItem>
  );
};

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract;
  onSubmit: (data: ContractFormData) => void;
  isLoading?: boolean;
}

const ContractFormDialog = ({
  open,
  onOpenChange,
  contract,
  onSubmit,
  isLoading,
}: ContractFormDialogProps) => {
  const { data: categories = [] } = useCategories();
  const isEditing = !!contract;

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      name: "",
      supplier_name: "",
      category_id: "",
      description: "",
      termination_period_days: 30,
      silent_renewal: true,
      renewal_period_months: 12,
      monthly_cost: 0,
      yearly_cost: 0,
      variable_costs: "",
      contact_email: "",
      contact_phone: "",
      notes: "",
      division: "",
      department: "",
    },
  });

  useEffect(() => {
    if (contract) {
      form.reset({
        name: contract.name,
        supplier_name: contract.supplier_name,
        category_id: contract.category_id || "",
        description: contract.description || "",
        start_date: new Date(contract.start_date),
        end_date: new Date(contract.end_date),
        termination_period_days: contract.termination_period_days,
        silent_renewal: contract.silent_renewal,
        renewal_period_months: contract.renewal_period_months,
        monthly_cost: contract.monthly_cost,
        yearly_cost: contract.yearly_cost,
        variable_costs: contract.variable_costs || "",
        contact_email: contract.contact_email || "",
        contact_phone: contract.contact_phone || "",
        notes: contract.notes || "",
        division: contract.division || "",
        department: contract.department || "",
      });
    } else {
      form.reset();
    }
  }, [contract, form]);

  const handleSubmit = (values: ContractFormValues) => {
    const data: ContractFormData = {
      name: values.name,
      supplier_name: values.supplier_name,
      start_date: format(values.start_date, "yyyy-MM-dd"),
      end_date: format(values.end_date, "yyyy-MM-dd"),
      category_id: values.category_id || undefined,
      description: values.description,
      termination_period_days: values.termination_period_days,
      silent_renewal: values.silent_renewal,
      renewal_period_months: values.renewal_period_months,
      monthly_cost: values.monthly_cost,
      yearly_cost: values.yearly_cost,
      variable_costs: values.variable_costs,
      contact_email: values.contact_email,
      contact_phone: values.contact_phone,
      notes: values.notes,
      division: values.division,
      department: values.department,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Contract bewerken" : "Nieuw contract toevoegen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Pas de gegevens van dit contract aan."
              : "Vul de gegevens in om een nieuw contract toe te voegen."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractnaam *</FormLabel>
                    <FormControl>
                      <Input placeholder="bijv. Internet & Telefonie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leverancier *</FormLabel>
                    <FormControl>
                      <Input placeholder="bijv. KPN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecteer categorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Divisie / Vestiging</FormLabel>
                    <FormControl>
                      <Input placeholder="bijv. Hoofdkantoor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Omschrijving</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Korte beschrijving van het contract..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <DateInputField label="Startdatum *" value={field.value} onChange={field.onChange} />
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <DateInputField label="Einddatum *" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {/* Renewal Settings */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="termination_period_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opzegtermijn (dagen)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="renewal_period_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verlengperiode (maanden)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="silent_renewal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Stilzwijgende verlenging</FormLabel>
                      <FormDescription className="text-xs">
                        Contract verlengt automatisch
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Costs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="monthly_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maandkosten (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearly_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jaarkosten (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact e-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="leverancier@voorbeeld.nl" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact telefoon</FormLabel>
                    <FormControl>
                      <Input placeholder="+31 20 123 4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notities</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Extra opmerkingen over dit contract..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && contract && (
              <>
                <Separator />
                <ContractDocuments contractId={contract.id} />
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuleren
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Opslaan..." : isEditing ? "Wijzigingen opslaan" : "Contract toevoegen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ContractFormDialog;
