import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package } from "lucide-react";
import ItemCard from "./ItemCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

interface ItemsSectionProps {
  type: "lost" | "found";
  title: string;
  description: string;
}

const ItemsSection = ({ type, title, description }: ItemsSectionProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const tableName = type === "lost" ? "lost_items" : "found_items";

  useEffect(() => {
    fetchItems();
    subscribeToChanges();
  }, [type]);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery, categoryFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
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

  const subscribeToChanges = () => {
    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
        },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filterItems = () => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  return (
    <section id={`${type}-items`} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">{title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search by item name, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ID Card">ID Card</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Bag">Bag</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading items...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Package className="w-16 h-16 text-muted-foreground mx-auto" />
              <h3 className="text-2xl font-semibold text-foreground">No items found</h3>
              <p className="text-muted-foreground">
                {searchQuery || categoryFilter !== "all"
                  ? "Try adjusting your search filters"
                  : `No ${type} items have been reported yet`}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} {...item} type={type} />
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && filteredItems.length > 0 && (
            <p className="text-center text-muted-foreground">
              Showing {filteredItems.length} of {items.length} items
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default ItemsSection;