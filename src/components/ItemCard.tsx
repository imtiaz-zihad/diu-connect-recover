import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Mail, Phone, Package, Hand } from "lucide-react";
import { format } from "date-fns";
import ClaimItemDialog from "./ClaimItemDialog";

interface ItemCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  date: string;
  description: string;
  image?: string;
  type: "lost" | "found";
}

const ItemCard = ({
  id,
  name,
  email,
  phone,
  category,
  location,
  date,
  description,
  image,
  type,
}: ItemCardProps) => {
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);

  const categoryColors: Record<string, string> = {
    "ID Card": "bg-blue-100 text-blue-800 border-blue-200",
    "Electronics": "bg-purple-100 text-purple-800 border-purple-200",
    "Bag": "bg-green-100 text-green-800 border-green-200",
    "Wallet": "bg-orange-100 text-orange-800 border-orange-200",
    "Others": "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2">
        {/* Image */}
        {image && (
          <div className="relative h-48 overflow-hidden bg-muted">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3">
              <Badge className={type === "lost" ? "bg-red-500" : "bg-secondary"}>
                {type === "lost" ? "Lost" : "Found"}
              </Badge>
            </div>
          </div>
        )}

        <CardContent className="p-6 space-y-4">
          {/* Category Badge */}
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline" className={categoryColors[category] || categoryColors["Others"]}>
              {category}
            </Badge>
          </div>

          {/* Item Name */}
          <h3 className="text-xl font-bold text-card-foreground line-clamp-1">{name}</h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>

          {/* Details Grid */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <span>{format(new Date(date), "MMM dd, yyyy")}</span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-4 border-t space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Contact Information
            </p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-secondary" />
                <a href={`mailto:${email}`} className="text-primary hover:underline line-clamp-1">
                  {email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-secondary" />
                <a href={`tel:${phone}`} className="text-primary hover:underline">
                  {phone}
                </a>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          <Button 
            className="w-full mt-4" 
            variant="outline"
            onClick={() => setClaimDialogOpen(true)}
          >
            <Hand className="w-4 h-4 mr-2" />
            Claim This Item
          </Button>
        </CardContent>
      </Card>

      <ClaimItemDialog
        open={claimDialogOpen}
        onOpenChange={setClaimDialogOpen}
        itemId={id}
        itemType={type}
        itemName={name}
      />
    </>
  );
};

export default ItemCard;
