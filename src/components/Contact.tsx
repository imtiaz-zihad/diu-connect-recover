import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">Get In Touch</h2>
            <p className="text-lg text-muted-foreground">
              Have questions or need help? We're here to assist you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 pt-8">
            <div className="space-y-3 p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Email</h3>
              <a
                href="mailto:support@diu.edu.bd"
                className="text-primary hover:underline block"
              >
                support@diu.edu.bd
              </a>
            </div>

            <div className="space-y-3 p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-card-foreground">Phone</h3>
              <a
                href="tel:+8809666773344"
                className="text-primary hover:underline block"
              >
                +880 9666 773344
              </a>
            </div>

            <div className="space-y-3 p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-card-foreground">Location</h3>
              <p className="text-muted-foreground text-sm">
                Daffodil Smart City, Birulia, Dhaka
              </p>
            </div>
          </div>

          <div className="pt-8">
            <Button size="lg" className="px-8">
              <Mail className="mr-2 h-5 w-5" />
              Send us a message
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;