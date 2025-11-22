import { Button } from "@/components/ui/button";
import { Search, FileText, CheckCircle2 } from "lucide-react";

interface HeroProps {
  onReportLost: () => void;
  onReportFound: () => void;
  onViewItems: () => void;
}

const Hero = ({ onReportLost, onReportFound, onViewItems }: HeroProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-primary via-primary-hover to-secondary overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/30">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Daffodil International University</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            DIU Lost & Found Hub
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            A simple way for DIU students to report and recover lost items on campus
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button
              size="lg"
              onClick={onReportLost}
              className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              <FileText className="mr-2 h-5 w-5" />
              Report Lost Item
            </Button>
            <Button
              size="lg"
              onClick={onReportFound}
              className="bg-secondary text-white hover:bg-secondary-hover font-semibold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Report Found Item
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={onViewItems}
            className="text-white hover:bg-white/10 mt-4"
          >
            <Search className="mr-2 h-5 w-5" />
            View All Items
          </Button>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#ffffff"
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;