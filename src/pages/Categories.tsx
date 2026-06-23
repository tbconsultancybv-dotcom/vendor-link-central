import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  description: string | null;
  created_by: string | null;
}

const DEFAULT_COLOR = "#3B82F6";
const DEFAULT_ICON = "Tag";

const Categories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [description, setDescription] = useState("");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const resetForm = () => {
    setEditing(null);
    setName("");
    setColor(DEFAULT_COLOR);
    setIcon(DEFAULT_ICON);
    setDescription("");
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color || DEFAULT_COLOR);
    setIcon(cat.icon || DEFAULT_ICON);
    setDescription(cat.description || "");
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Niet ingelogd");
      if (!name.trim()) throw new Error("Naam is verplicht");

      if (editing) {
        const { error } = await supabase
          .from("contract_categories")
          .update({ name: name.trim(), color, icon, description: description.trim() || null })
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("contract_categories")
          .insert({
            name: name.trim(),
            color,
            icon,
            description: description.trim() || null,
            created_by: user.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: editing ? "Categorie bijgewerkt" : "Categorie toegevoegd",
        description: `${name} is opgeslagen.`,
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Fout", description: err.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contract_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categorie verwijderd" });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Verwijderen mislukt", description: err.message });
    },
  });

  const ownCategories = categories.filter((c) => c.created_by === user?.id);
  const defaultCategories = categories.filter((c) => c.created_by !== user?.id);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <DashboardHeader title="Categorieën" subtitle="Beheer je contractcategorieën" />
        <main className="p-8">
          <div className="flex items-center justify-end mb-8">
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" /> Nieuwe categorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Categorie bewerken" : "Nieuwe categorie"}
                  </DialogTitle>
                  <DialogDescription>
                    Geef je categorie een naam en kies een kleur ter herkenning.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="cat-name">Naam *</Label>
                    <Input
                      id="cat-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="bv. Drukwerk speciaal"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat-desc">Omschrijving</Label>
                    <Input
                      id="cat-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optioneel"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-color">Kleur</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="cat-color"
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cat-icon">Icoon (lucide naam)</Label>
                      <Input
                        id="cat-icon"
                        value={icon}
                        onChange={(e) => setIcon(e.target.value)}
                        placeholder="Tag"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? "Opslaan..." : "Opslaan"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <p className="text-muted-foreground">Laden...</p>
          ) : (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Jouw categorieën</CardTitle>
                  <CardDescription>
                    Categorieën die je zelf hebt toegevoegd kun je bewerken of verwijderen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ownCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Je hebt nog geen eigen categorieën toegevoegd.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ownCategories.map((cat) => (
                        <CategoryCard
                          key={cat.id}
                          cat={cat}
                          editable
                          onEdit={() => openEdit(cat)}
                          onDelete={() => deleteMutation.mutate(cat.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Standaardcategorieën ({defaultCategories.length})</CardTitle>
                  <CardDescription>
                    Vooraf ingeladen door BivaroX. Deze zijn beschikbaar voor alle gebruikers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {defaultCategories.map((cat) => (
                      <CategoryCard key={cat.id} cat={cat} editable={false} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

interface CategoryCardProps {
  cat: Category;
  editable: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CategoryCard = ({ cat, editable, onEdit, onDelete }: CategoryCardProps) => (
  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/40 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: (cat.color || "#3B82F6") + "20", color: cat.color || "#3B82F6" }}
      >
        <Tag className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="font-medium text-foreground truncate">{cat.name}</div>
        {cat.description && (
          <div className="text-xs text-muted-foreground truncate">{cat.description}</div>
        )}
      </div>
    </div>
    {editable ? (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Categorie verwijderen?</AlertDialogTitle>
              <AlertDialogDescription>
                "{cat.name}" wordt definitief verwijderd. Contracten met deze categorie houden hun
                gegevens, maar krijgen geen categorie meer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleren</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Verwijderen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    ) : (
      <Badge variant="secondary" className="text-xs">Standaard</Badge>
    )}
  </div>
);

export default Categories;
