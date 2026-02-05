import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog";
import { useDocuments, Document } from "@/hooks/useDocuments";
import { useContracts } from "@/hooks/useContracts";
import {
  Upload,
  FileText,
  File,
  Image,
  Search,
  MoreVertical,
  Download,
  Link2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

const DocumentsPage = () => {
  const { documents, isLoading, uploadDocument, linkToContract, deleteDocument, getDownloadUrl } = useDocuments();
  const { contracts } = useContracts();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [linkFilter, setLinkFilter] = useState<string>("all");
  
  // Dialog States
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string>("");

  // Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      uploadDocument.mutate({ file });
    });
  }, [uploadDocument]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      linkFilter === "all" ||
      (linkFilter === "linked" && doc.is_linked) ||
      (linkFilter === "unlinked" && !doc.is_linked);
    return matchesSearch && matchesFilter;
  });

  // Handlers
  const handleLinkDocument = () => {
    if (selectedDocument && selectedContractId) {
      linkToContract.mutate(
        { documentId: selectedDocument.id, contractId: selectedContractId },
        { onSuccess: () => setLinkDialogOpen(false) }
      );
    }
  };

  const handleDeleteDocument = () => {
    if (selectedDocument) {
      deleteDocument.mutate(selectedDocument, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const url = await getDownloadUrl(doc.file_path);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="w-5 h-5" />;
    if (fileType.includes("pdf")) return <FileText className="w-5 h-5 text-destructive" />;
    if (fileType.includes("image")) return <Image className="w-5 h-5 text-primary" />;
    if (fileType.includes("word")) return <FileText className="w-5 h-5 text-primary" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <DashboardHeader
          title="Documenten"
          subtitle="Upload en beheer contractdocumenten"
        />

        <div className="p-6">
          {/* Upload Area */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className={cn(
                  "w-12 h-12 mx-auto mb-4",
                  isDragActive ? "text-primary" : "text-muted-foreground"
                )} />
                <p className="text-lg font-medium mb-1">
                  {isDragActive ? "Laat los om te uploaden" : "Sleep documenten hierheen"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Of klik om bestanden te selecteren (PDF, Word, afbeeldingen)
                </p>
                {uploadDocument.isPending && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-primary">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploaden...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Zoek documenten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={linkFilter} onValueChange={setLinkFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle documenten</SelectItem>
                <SelectItem value="linked">Gekoppeld</SelectItem>
                <SelectItem value="unlinked">Niet gekoppeld</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Documents Table */}
          <Card>
            <CardHeader>
              <CardTitle>Documenten</CardTitle>
              <CardDescription>
                {documents.length} document{documents.length !== 1 ? "en" : ""} geüpload
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bestandsnaam</TableHead>
                    <TableHead>Gekoppeld contract</TableHead>
                    <TableHead>Bron</TableHead>
                    <TableHead>Grootte</TableHead>
                    <TableHead>Geüpload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        Documenten laden...
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          {documents.length === 0
                            ? "Nog geen documenten geüpload"
                            : "Geen documenten gevonden"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.file_type)}
                            <span className="font-medium">{doc.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.contract ? (
                            <div className="flex items-center gap-2">
                              <Link2 className="w-4 h-4 text-success" />
                              <span>{doc.contract.name}</span>
                            </div>
                          ) : doc.suggested_contract_id ? (
                            <Badge variant="secondary" className="bg-warning/10 text-warning">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Suggestie beschikbaar
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {doc.source === "upload" && "Upload"}
                            {doc.source === "email" && "E-mail"}
                            {doc.source === "scan" && "Scan"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(doc.created_at), {
                            addSuffix: true,
                            locale: nl,
                          })}
                        </TableCell>
                        <TableCell>
                          {doc.is_linked ? (
                            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Gekoppeld
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                              Niet gekoppeld
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                <Download className="w-4 h-4 mr-2" />
                                Downloaden
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDocument(doc);
                                  setSelectedContractId(doc.contract_id || "");
                                  setLinkDialogOpen(true);
                                }}
                              >
                                <Link2 className="w-4 h-4 mr-2" />
                                Koppelen aan contract
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedDocument(doc);
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
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Link to Contract Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document koppelen aan contract</DialogTitle>
            <DialogDescription>
              Selecteer het contract waaraan dit document gekoppeld moet worden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                {selectedDocument && getFileIcon(selectedDocument.file_type)}
                <span className="font-medium">{selectedDocument?.file_name}</span>
              </div>
            </div>

            <Select value={selectedContractId} onValueChange={setSelectedContractId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een contract" />
              </SelectTrigger>
              <SelectContent>
                {contracts.map((contract) => (
                  <SelectItem key={contract.id} value={contract.id}>
                    {contract.name} - {contract.supplier_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Annuleren
            </Button>
            <Button
              onClick={handleLinkDocument}
              disabled={!selectedContractId || linkToContract.isPending}
            >
              {linkToContract.isPending ? "Koppelen..." : "Koppelen"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Document verwijderen?</AlertDialogTitle>
            <AlertDialogDescription>
              Weet je zeker dat je "{selectedDocument?.file_name}" wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuleren</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
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

export default DocumentsPage;
