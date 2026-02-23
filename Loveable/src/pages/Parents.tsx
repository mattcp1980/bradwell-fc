import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Calendar, Clock, MapPin, Mail, FileText, ShieldCheck, CreditCard } from "lucide-react";

const Parents = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-20">
        <div className="container px-4">
          <div className="text-center mb-12">
            <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
              Information
            </p>
            <h1 className="text-4xl md:text-5xl text-foreground uppercase">
              Parents Hub
            </h1>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Everything you need to know about your child's involvement with Bradwell FC.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <a
              href="https://bradwell-fc.hivelink.co.uk/451/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary/10 border-2 border-primary rounded-lg p-6 hover:bg-primary/20 transition-colors group block"
            >
              <CreditCard className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Make a Payment</h3>
              <p className="text-muted-foreground text-sm">
                Pay subs, kit fees, and other team payments securely through our Hivelink portal.
              </p>
              <span className="text-primary text-sm font-heading uppercase tracking-wide mt-3 inline-block group-hover:underline">
                Go to Payments →
              </span>
            </a>

            <div className="bg-card border border-border rounded-lg p-6">
              <Calendar className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Training Times</h3>
              <p className="text-muted-foreground text-sm">
                Training sessions run throughout the week across all age groups. Check with your team manager for specific days and times.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <MapPin className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Venues</h3>
              <p className="text-muted-foreground text-sm">
                Home matches and training take place at Bradwell Park. Away fixture details are shared by team managers ahead of match day.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <ShieldCheck className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Safeguarding</h3>
              <p className="text-muted-foreground text-sm">
                The welfare of every child is our priority. All coaches are DBS checked and FA safeguarding trained. Contact our Welfare Officer with any concerns.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <FileText className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Club Policies</h3>
              <p className="text-muted-foreground text-sm">
                Our code of conduct, anti-bullying policy, and respect programme documents are available from your team manager or the club secretary.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Clock className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Match Days</h3>
              <p className="text-muted-foreground text-sm">
                Please arrive 15 minutes before kick-off. Ensure your child has shin pads, boots, and their kit. We encourage positive touchline behaviour from all supporters.
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <Mail className="text-primary mb-3" size={28} />
              <h3 className="font-heading text-lg uppercase text-foreground mb-2">Get In Touch</h3>
              <p className="text-muted-foreground text-sm">
                Questions? Reach out to your team manager directly, or contact the club via our social media channels or email.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Parents;
