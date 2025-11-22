import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Check, X, Package, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
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

const Admin = () => {
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      setLoading(true);
      
      const { data: lost, error: lostError } = await supabase
        .from("lost_items")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: found, error: foundError } = await supabase
        .from("found_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (lostError) throw lostError;
      if (foundError) throw foundError;

      setLostItems(lost || []);
      setFoundItems(found || []);
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

  const deleteItem = async (id: string, type: "lost" | "found") => {
    try {
      const tableName = type === "lost" ? "lost_items" : "found_items";
      const { error } = await supabase.from(tableName).delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      fetchAllItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, type: "lost" | "found", status: "approved" | "pending") => {
    try {
      const tableName = type === "lost" ? "lost_items" : "found_items";
      const { error } = await supabase
        .from(tableName)
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Item ${status}`,
      });

      fetchAllItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const ItemsList = ({ items, type }: { items: Item[]; type: "lost" | "found" }) => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No items found</p>
        </div>
      ) : (
        items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
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
                    <div>
                      <span className="font-medium">Category:</span> {item.category}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {item.location}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {format(new Date(item.date), "MMM dd, yyyy")}
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span> {item.email}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {item.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(item.id, type, "approved")}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    )}
                    {item.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(item.id, type, "pending")}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Unapprove
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteItem(item.id, type)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
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

  if (loading) {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground">Manage lost and found items</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Lost Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{lostItems.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Found Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-secondary">{foundItems.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-accent">{lostItems.length + foundItems.length}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="lost" className="space-y-6">
            <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2">
              <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
              <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="lost">
              <ItemsList items={lostItems} type="lost" />
            </TabsContent>

            <TabsContent value="found">
              <ItemsList items={foundItems} type="found" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;