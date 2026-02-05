import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useContracts, Contract } from "@/hooks/useContracts";
import PublishMarketplaceDialog from "@/components/contracts/PublishMarketplaceDialog";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Store,
  Calendar,
  ArrowRight,
  Check,
  Info,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

const NotificationsPage = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const { contracts, publishToMarketplace } = useContracts();
  
  // Dialog states
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    setSelectedNotification(notification);
  };

  const handlePublishFromNotification = (notification: Notification) => {
    const contract = contracts.find((c) => c.id === notification.contract_id);
    if (contract) {
      setSelectedContract(contract);
      setSelectedNotification(null);
      setPublishDialogOpen(true);
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

  const getPriorityIcon = (priority: Notification["priority"]) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "high":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "medium":
        return <Info className="w-5 h-5 text-primary" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "expiry_warning":
        return <Clock className="w-4 h-4" />;
      case "action_required":
        return <AlertTriangle className="w-4 h-4" />;
      case "lead_update":
        return <Store className="w-4 h-4" />;
      case "document_received":
        return <FileText className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = (filter: string) => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    if (filter === "action") return notifications.filter((n) => n.type === "action_required" || n.type === "expiry_warning");
    return notifications;
  };

  const renderNotificationItem = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        "p-4 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.is_read && "bg-primary/5"
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          notification.priority === "critical" && "bg-destructive/10",
          notification.priority === "high" && "bg-warning/10",
          notification.priority === "medium" && "bg-primary/10",
          notification.priority === "low" && "bg-muted"
        )}>
          {getPriorityIcon(notification.priority)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={cn(
                "font-medium text-foreground",
                !notification.is_read && "font-semibold"
              )}>
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                {notification.message}
              </p>
            </div>
            {!notification.is_read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="text-xs">
              {getTypeIcon(notification.type)}
              <span className="ml-1">
                {notification.type === "expiry_warning" && "Verloopt"}
                {notification.type === "action_required" && "Actie vereist"}
                {notification.type === "lead_update" && "Lead update"}
                {notification.type === "document_received" && "Document"}
                {notification.type === "system" && "Systeem"}
              </span>
            </Badge>
            
            {notification.contract && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {notification.contract.name}
              </span>
            )}
            
            <span className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: nl,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64">
        <DashboardHeader
          title="Notificaties"
          subtitle="Alle meldingen en acties voor je contracten"
        />

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{unreadCount}</p>
                    <p className="text-sm text-muted-foreground">Ongelezen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {notifications.filter((n) => n.type === "expiry_warning").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Verlopen binnenkort</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {notifications.filter((n) => n.priority === "critical" || n.priority === "high").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Urgent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {notifications.filter((n) => n.is_actioned).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Afgehandeld</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications List */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Meldingen</CardTitle>
                <CardDescription>
                  Bekijk en beheer al je contractmeldingen
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Alles gelezen
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-6 border-b border-border">
                  <TabsList className="bg-transparent h-auto p-0 gap-6">
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-3"
                    >
                      Alles ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="unread"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-3"
                    >
                      Ongelezen ({unreadCount})
                    </TabsTrigger>
                    <TabsTrigger
                      value="action"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-3"
                    >
                      Actie vereist
                    </TabsTrigger>
                  </TabsList>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center text-muted-foreground">
                    Meldingen laden...
                  </div>
                ) : (
                  <>
                    <TabsContent value="all" className="m-0">
                      {filteredNotifications("all").length === 0 ? (
                        <div className="p-12 text-center">
                          <Inbox className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground">Geen meldingen</p>
                        </div>
                      ) : (
                        filteredNotifications("all").map(renderNotificationItem)
                      )}
                    </TabsContent>
                    
                    <TabsContent value="unread" className="m-0">
                      {filteredNotifications("unread").length === 0 ? (
                        <div className="p-12 text-center">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success/50" />
                          <p className="text-muted-foreground">Alle meldingen zijn gelezen</p>
                        </div>
                      ) : (
                        filteredNotifications("unread").map(renderNotificationItem)
                      )}
                    </TabsContent>
                    
                    <TabsContent value="action" className="m-0">
                      {filteredNotifications("action").length === 0 ? (
                        <div className="p-12 text-center">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-success/50" />
                          <p className="text-muted-foreground">Geen acties vereist</p>
                        </div>
                      ) : (
                        filteredNotifications("action").map(renderNotificationItem)
                      )}
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Notification Detail Dialog */}
      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        {selectedNotification && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getPriorityIcon(selectedNotification.priority)}
                {selectedNotification.title}
              </DialogTitle>
              <DialogDescription>
                {formatDistanceToNow(new Date(selectedNotification.created_at), {
                  addSuffix: true,
                  locale: nl,
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-foreground">{selectedNotification.message}</p>

              {selectedNotification.contract && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <FileText className="w-4 h-4" />
                    Gekoppeld contract
                  </div>
                  <p className="font-medium">{selectedNotification.contract.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedNotification.contract.supplier_name}
                  </p>
                </div>
              )}

              {selectedNotification.due_date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Deadline: {new Date(selectedNotification.due_date).toLocaleDateString("nl-NL")}</span>
                </div>
              )}

              {/* Action buttons based on notification type */}
              {selectedNotification.type === "expiry_warning" && selectedNotification.contract_id && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedNotification(null)}
                  >
                    Later bekijken
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handlePublishFromNotification(selectedNotification)}
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Vergelijk op marktplaats
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Publish to Marketplace Dialog */}
      {selectedContract && (
        <PublishMarketplaceDialog
          open={publishDialogOpen}
          onOpenChange={setPublishDialogOpen}
          contract={selectedContract}
          onPublish={handlePublishToMarketplace}
          isLoading={publishToMarketplace.isPending}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
