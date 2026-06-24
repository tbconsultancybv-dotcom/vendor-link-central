import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useContracts, useCategories, Contract, ContractFormData } from "@/hooks/useContracts";
import ContractFormDialog from "@/components/contracts/ContractFormDialog";
import PublishMarketplaceDialog from "@/components/contracts/PublishMarketplaceDialog";
import ContractDetailsDialog from "@/components/contracts/ContractDetailsDialog";
import {
  Search,
  Filter,
  MoreVertical,
  FileText,
  Edit,
  Trash2,
  Store,
  Calendar,
  Euro,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ContractsPage = () => {
  const navigate = useNavigate();
  const { contracts, isLoading, createContract, updateContract, deleteContract, publishToMarketplace } = useContracts();
  const { data: categories = [] } = useCategories();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Dialog States
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>();

  // Filtered contracts
  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.supplier_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || contract.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handlers
  const handleCreateContract = (data: ContractFormData) => {
    createContract.mutate(data, {
      onSuccess: () => setFormDialogOpen(false),
    });
  };

  const handleUpdateContract = (data: ContractFormData) => {
    if (selectedContract) {
      updateContract.mutate(
        { id: selectedContract.id, data },
        { onSuccess: () => setFormDialogOpen(false) }
      );
    }
  };

  const handleDeleteContract = () => {
    if (selectedContract) {
      deleteContract.mutate(selectedContract.id, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  const handlePublishToMarketplace = (maxSuppliers: number, dataVisibility: number) => {
    if (selectedContract) {
      publishToMarketplace.mutate(
        {
          contractId: selectedContract.id,
          maxSuppliers,
          dataVisibilityLevel: dataVisibility,
        },
        { onSuccess: () => setPublishDialogOpen(false) }
      );
    }
  };

  const getStatusBadge = (status: Contract["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Actief
          </Badge>
        );
      case "expiring":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Verloopt
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <Clock className="w-3 h-3 mr-1" />
            Verlopen
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Concept
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <DashboardHeader
          title="Contracten"
          subtitle="Beheer al je zakelijke contracten op één plek"
          showAddButton
          addButtonLabel="Nieuw Contract"
          onAddClick={() => {
            setSelectedContract(undefined);
            setFormDialogOpen(true);
          }}
        />

        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Zoek contracten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="expiring">Verloopt</SelectItem>
                <SelectItem value="expired">Verlopen</SelectItem>
                <SelectItem value="draft">Concept</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contracts Table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Leverancier</TableHead>
                  <TableHead>Categorie</TableHead>
                  <TableHead>Einddatum</TableHead>
                  <TableHead>Maandkosten</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Contracten laden...
                    </TableCell>
                  </TableRow>
                ) : filteredContracts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-4">
                        {contracts.length === 0
                          ? "Nog geen contracten toegevoegd"
                          : "Geen contracten gevonden met deze filters"}
                      </p>
                      {contracts.length === 0 && (
                        <Button onClick={() => setFormDialogOpen(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Eerste contract toevoegen
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContracts.map((contract) => {
                    const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
                    
                    return (
                      <TableRow
                        key={contract.id}
                        className="group cursor-pointer"
                        onClick={() => {
                          setSelectedContract(contract);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center",
                              contract.status === "expiring" && "bg-warning/10",
                              contract.status === "expired" && "bg-destructive/10",
                              contract.status === "active" && "bg-primary/10"
                            )}>
                              <FileText className={cn(
                                "w-5 h-5",
                                contract.status === "expiring" && "text-warning",
                                contract.status === "expired" && "text-destructive",
                                contract.status === "active" && "text-primary"
                              )} />
                            </div>
                            <div>
                              <p className="font-medium">{contract.name}</p>
                              {contract.division && (
                                <p className="text-xs text-muted-foreground">{contract.division}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{contract.supplier_name}</TableCell>
                        <TableCell>
                          {contract.category ? (
                            <Badge variant="secondary" className="font-normal">
                              {contract.category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(contract.end_date).toLocaleDateString("nl-NL")}</span>
                            {daysUntilExpiry > 0 && daysUntilExpiry <= 90 && (
                              <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                                {daysUntilExpiry}d
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Euro className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">
                              {contract.monthly_cost.toLocaleString("nl-NL")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(contract.status)}
                            {contract.is_on_marketplace && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                                <Store className="w-3 h-3 mr-1" />
                                Markt
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setDetailsDialogOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Bekijken
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setFormDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Bewerken
                              </DropdownMenuItem>
                              {!contract.is_on_marketplace && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedContract(contract);
                                    setPublishDialogOpen(true);
                                  }}
                                >
                                  <Store className="w-4 h-4 mr-2" />
                                  Publiceer op marktplaats
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <ContractFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        contract={selectedContract}
        onSubmit={selectedContract ? handleUpdateContract : handleCreateContract}
        isLoading={createContract.isPending || updateContract.isPending}
      />

      {selectedContract && (
        <PublishMarketplaceDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          contract={selectedContract}
          onPublish={handlePublishToMarketplace}
          isLoading={publishToMarketplace.isPending}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contract verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{selectedContract?.name}" wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContract}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractsPage;
