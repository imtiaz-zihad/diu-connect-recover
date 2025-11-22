import { FileText, Search, MessageCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "Report",
      description: "Submit a detailed report of your lost or found item with photos and location details.",
      color: "primary",
    },
    {
      icon: Search,
      title: "Browse",
      description: "Search through reported items using filters for category, date, and location.",
      color: "secondary",
    },
    {
      icon: MessageCircle,
      title: "Connect",
      description: "Contact the person who found your item or the owner directly through provided details.",
      color: "accent",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to reunite with your belongings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="space-y-4 p-8 rounded-2xl bg-card border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:-translate-y-2 duration-300">
                  {/* Step number */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-${step.color}/10 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-8 h-8 text-${step.color}`} />
                  </div>

                  <h3 className="text-2xl font-bold text-card-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>

                {/* Connector arrow (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                    <svg width="32" height="32" viewBox="0 0 32 32" className="text-primary">
                      <path
                        d="M16 4 l12 12 l-12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;