import { Target, Users, Shield } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold text-foreground">
            About DIU Lost & Found Hub
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our platform connects DIU students who have lost items with those who have found them.
            Whether you've lost your ID card in the library or found a phone in the cafeteria,
            this hub makes it easy to reunite items with their owners.
          </p>

          <div className="grid md:grid-cols-3 gap-8 pt-12">
            <div className="space-y-4 p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Our Mission</h3>
              <p className="text-muted-foreground">
                To create a safe, efficient platform for DIU students to report and recover lost belongings.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Community Driven</h3>
              <p className="text-muted-foreground">
                Built by students, for students. Every report helps build a stronger campus community.
              </p>
            </div>

            <div className="space-y-4 p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your information is protected. Contact details are only shared when necessary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;