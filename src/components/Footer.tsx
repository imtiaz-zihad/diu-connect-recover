import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-8">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold">DIU Lost & Found Hub</h3>
          <p className="text-background/80">
            Making campus life easier, one found item at a time
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-background/60">
            <span>© 2025 DIU Lost & Found Hub</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by Imtiaz
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;