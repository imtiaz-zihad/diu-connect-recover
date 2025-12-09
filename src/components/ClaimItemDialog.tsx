import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { z } from "zod";

interface ClaimItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  itemType: "lost" | "found";
  itemName: string;
}

const claimSchema = z.object({
  claimantName: z.string().min(1, "Name is required").max(100),
  studentId: z.string().min(1, "Student ID is required").max(50),
  diuEmail: z.string().email("Please enter a valid DIU email").refine(
    (email) => email.endsWith("@diu.edu.bd") || email.endsWith("@diu.ac.bd"),
    "Please use a valid DIU email address"
  ),
  phone: z.string().min(11, "Phone number must be at least 11 digits").max(15),
});

const ClaimItemDialog = ({ open, onOpenChange, itemId, itemType, itemName }: ClaimItemDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    claimantName: "",
    studentId: "",
    diuEmail: "",
    phone: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with Zod
    const result = claimSchema.safeParse(formData);
    if (!result.success) {
      toast({
        title: "Validation Error",
        description: result.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!imageFile) {
      toast({
        title: "Missing Proof",
        description: "Please upload a proof of ownership image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check auto-approve setting
      const { data: autoSetting } = await supabase
        .from("admin_settings")
        .select("setting_value")
        .eq("setting_key", "auto_approve_claims")
        .maybeSingle();

      const autoApprove = autoSetting?.setting_value ?? false;

      // Upload proof image
      let proofImageUrl = null;
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("claim-proofs")
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("claim-proofs")
        .getPublicUrl(fileName);

      proofImageUrl = urlData.publicUrl;

      // Insert claim into database
      const { error: insertError } = await supabase.from("claims").insert({
        item_id: itemId,
        item_type: itemType,
        claimant_name: formData.claimantName,
        student_id: formData.studentId,
        diu_email: formData.diuEmail,
        phone: formData.phone,
        proof_image: proofImageUrl,
        status: autoApprove ? "approved" : "pending",
      });

      if (insertError) throw insertError;

      toast({
        title: "Claim Submitted!",
        description: autoApprove 
          ? "Your claim has been automatically approved."
          : "Your claim has been submitted and is pending admin approval.",
      });

      // Reset form
      setFormData({
        claimantName: "",
        studentId: "",
        diuEmail: "",
        phone: "",
      });
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Claim Item</DialogTitle>
          <DialogDescription>
            Fill in your details to claim "{itemName}". Upload proof of ownership.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="claimantName">Your Full Name *</Label>
            <Input
              id="claimantName"
              value={formData.claimantName}
              onChange={(e) => handleInputChange("claimantName", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID *</Label>
            <Input
              id="studentId"
              value={formData.studentId}
              onChange={(e) => handleInputChange("studentId", e.target.value)}
              placeholder="e.g., 221-15-XXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="diuEmail">DIU Email *</Label>
            <Input
              id="diuEmail"
              type="email"
              value={formData.diuEmail}
              onChange={(e) => handleInputChange("diuEmail", e.target.value)}
              placeholder="yourname@diu.edu.bd"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+880 1XXX-XXXXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofImage">Proof of Ownership *</Label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Proof Preview" className="w-full h-48 object-cover rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <Label htmlFor="proofImage" className="cursor-pointer">
                  <span className="text-primary hover:underline">Click to upload</span>
                  <span className="text-muted-foreground text-sm block mt-1">
                    Photo proof that the item belongs to you
                  </span>
                </Label>
                <Input
                  id="proofImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Claim"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClaimItemDialog;
