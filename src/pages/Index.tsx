import { useState } from "react";
import Hero from "@/components/Hero";
import About from "@/components/About";
import HowItWorks from "@/components/HowItWorks";
import ItemsSection from "@/components/ItemsSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ReportItemDialog from "@/components/ReportItemDialog";

const Index = () => {
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [foundDialogOpen, setFoundDialogOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <Hero
        onReportLost={() => setLostDialogOpen(true)}
        onReportFound={() => setFoundDialogOpen(true)}
        onViewItems={() => scrollToSection("lost-items")}
      />
      
      <About />
      
      <HowItWorks />
      
      <ItemsSection
        type="lost"
        title="Lost Items"
        description="Browse through items that have been reported as lost. If you've found any of these items, please contact the owner."
      />
      
      <ItemsSection
        type="found"
        title="Found Items"
        description="Check if someone has found your lost item. Contact them directly to claim your belongings."
      />
      
      <Contact />
      
      <Footer />

      <ReportItemDialog
        open={lostDialogOpen}
        onOpenChange={setLostDialogOpen}
        type="lost"
      />

      <ReportItemDialog
        open={foundDialogOpen}
        onOpenChange={setFoundDialogOpen}
        type="found"
      />
    </div>
  );
};

export default Index;