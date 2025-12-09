import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Check, X, Package, ArrowLeft, LogOut, Settings, ClipboardList, Zap } from "lucide-react";
import { format } from "date-fns";

interface Item {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  date: string;
  description: string;
  image: string | null;
  status: string;
  created_at: string;
}

interface Claim {
  id: string;
  item_id: string;
  item_type: string;
  claimant_name: string;
  student_id: string;
  diu_email: string;
  phone: string;
  proof_image: string | null;
  status: string;
  created_at: string;
}

const Admin = () => {
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoApproveItems, setAutoApproveItems] = useState(false);
  const [autoApproveClaims, setAutoApproveClaims] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/admin/login");
        return;
      }
      if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      fetchAllData();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const [lostRes, foundRes, claimsRes, settingsRes] = await Promise.all([
        supabase.from("lost_items").select("*").order("created_at", { ascending: false }),
        supabase.from("found_items").select("*").order("created_at", { ascending: false }),
        supabase.from("claims").select("*").order("created_at", { ascending: false }),
        supabase.from("admin_settings").select("*"),
      ]);

      if (lostRes.error) throw lostRes.error;
      if (foundRes.error) throw foundRes.error;
      if (claimsRes.error) throw claimsRes.error;

      setLostItems(lostRes.data || []);
      setFoundItems(foundRes.data || []);
      setClaims(claimsRes.data || []);

      // Set auto-approve settings
      const settings = settingsRes.data || [];
      const autoItems = settings.find(s => s.setting_key === "auto_approve_items");
      const autoClaims = settings.find(s => s.setting_key === "auto_approve_claims");
      setAutoApproveItems(autoItems?.setting_value ?? false);
      setAutoApproveClaims(autoClaims?.setting_value ?? false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAutoSetting = async (key: string, value: boolean) => {
    try {
      const { error } = await supabase
        .from("admin_settings")
        .update({ setting_value: value, updated_at: new Date().toISOString(), updated_by: user?.id })
        .eq("setting_key", key);

      if (error) throw error;

      if (key === "auto_approve_items") {
        setAutoApproveItems(value);
      } else {
        setAutoApproveClaims(value);
      }

      toast({
        title: "Settings Updated",
        description: `Auto-approve ${key === "auto_approve_items" ? "items" : "claims"} is now ${value ? "ON" : "OFF"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string, type: "lost" | "found") => {
    try {
      const tableName = type === "lost" ? "lost_items" : "found_items";
      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Item deleted successfully" });
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateItemStatus = async (id: string, type: "lost" | "found", status: "approved" | "pending") => {
    try {
      const tableName = type === "lost" ? "lost_items" : "found_items";
      const { error } = await supabase.from(tableName).update({ status }).eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: `Item ${status}` });
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateClaimStatus = async (id: string, status: "approved" | "pending") => {
    try {
      const { error } = await supabase.from("claims").update({ status }).eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: `Claim ${status}` });
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteClaim = async (id: string) => {
    try {
      const { error } = await supabase.from("claims").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Claim deleted successfully" });
      fetchAllData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const pendingItems = [...lostItems, ...foundItems].filter(i => i.status === "pending").length;
  const pendingClaims = claims.filter(c => c.status === "pending").length;

  const ItemsList = ({ items, type }: { items: Item[]; type: "lost" | "found" }) => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No items found</p>
        </div>
      ) : (
        items.map((item) => (
          <Card key={item.id} className={item.status === "pending" ? "border-yellow-400" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-full md:w-32 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant={item.status === "approved" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Category:</span> {item.category}</div>
                    <div><span className="font-medium">Location:</span> {item.location}</div>
                    <div><span className="font-medium">Date:</span> {format(new Date(item.date), "MMM dd, yyyy")}</div>
                    <div><span className="font-medium">Contact:</span> {item.email}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {item.status === "pending" && (
                      <Button size="sm" onClick={() => updateItemStatus(item.id, type, "approved")}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    )}
                    {item.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => updateItemStatus(item.id, type, "pending")}>
                        <X className="w-4 h-4 mr-1" /> Disapprove
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id, type)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const ClaimsList = () => (
    <div className="space-y-4">
      {claims.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No claims found</p>
        </div>
      ) : (
        claims.map((claim) => (
          <Card key={claim.id} className={claim.status === "pending" ? "border-yellow-400" : ""}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {claim.proof_image && (
                  <img src={claim.proof_image} alt="Proof" className="w-full md:w-32 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{claim.claimant_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Claiming {claim.item_type} item
                      </p>
                    </div>
                    <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
                      {claim.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Student ID:</span> {claim.student_id}</div>
                    <div><span className="font-medium">Email:</span> {claim.diu_email}</div>
                    <div><span className="font-medium">Phone:</span> {claim.phone}</div>
                    <div><span className="font-medium">Date:</span> {format(new Date(claim.created_at), "MMM dd, yyyy")}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {claim.status === "pending" && (
                      <Button size="sm" onClick={() => updateClaimStatus(claim.id, "approved")}>
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    )}
                    {claim.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => updateClaimStatus(claim.id, "pending")}>
                        <X className="w-4 h-4 mr-1" /> Disapprove
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => deleteClaim(claim.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage lost/found items and claims</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Home
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </Button>
            </div>
          </div>

          {/* Auto-Mode Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" /> Auto-Approve Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-8">
              <div className="flex items-center space-x-3">
                <Switch
                  id="auto-items"
                  checked={autoApproveItems}
                  onCheckedChange={(checked) => updateAutoSetting("auto_approve_items", checked)}
                />
                <Label htmlFor="auto-items" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Auto-approve new items
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  id="auto-claims"
                  checked={autoApproveClaims}
                  onCheckedChange={(checked) => updateAutoSetting("auto_approve_claims", checked)}
                />
                <Label htmlFor="auto-claims" className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Auto-approve claims
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Lost Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{lostItems.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Found Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">{foundItems.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">{pendingItems}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pending Claims</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-500">{pendingClaims}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="lost" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
              <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
              <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
              <TabsTrigger value="claims">Claims ({claims.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="lost">
              <ItemsList items={lostItems} type="lost" />
            </TabsContent>

            <TabsContent value="found">
              <ItemsList items={foundItems} type="found" />
            </TabsContent>

            <TabsContent value="claims">
              <ClaimsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
