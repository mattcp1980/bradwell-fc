import { useState } from "react";
import { Calendar, Clock, MapPin, Mail, FileText, ShieldCheck, CreditCard, ChevronDown, ChevronUp } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";
import { TrainingScheduleView } from "@/components/shared/training-schedule-view";

export function ParentsPage() {
  const { data: content = {} } = useSiteContent();
  const g = (key: string, fallback: string) => content[key] || fallback;
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const paymentUrl = g('parents_make_a_payment_url', 'https://bradwell-fc.hivelink.co.uk/451/');

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
            Information
          </p>
          <h1 className="text-4xl md:text-5xl text-foreground uppercase">
            Parents Hub
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Everything you need to know about your child&apos;s involvement with Bradwell FC.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <a
            href={paymentUrl}
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

          <div
            className={`bg-card border border-border rounded-lg transition-all ${scheduleOpen ? 'md:col-span-2 lg:col-span-3' : ''}`}
          >
            <button
              onClick={() => setScheduleOpen((o) => !o)}
              className="w-full text-left p-6 flex items-start justify-between gap-4 group"
            >
              <div>
                <Calendar className="text-primary mb-3" size={28} />
                <h3 className="font-heading text-lg uppercase text-foreground mb-2">Training Times</h3>
                <p className="text-muted-foreground text-sm">
                  {g('parents_training_times', 'Training sessions run throughout the week across all age groups. Click to view the full schedule.')}
                </p>
              </div>
              <span className="text-primary mt-1 shrink-0">
                {scheduleOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>
            {scheduleOpen && (
              <div className="px-6 pb-6 border-t border-border pt-4">
                <TrainingScheduleView teamDropdown />
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <MapPin className="text-primary mb-3" size={28} />
            <h3 className="font-heading text-lg uppercase text-foreground mb-2">Venues</h3>
            <p className="text-muted-foreground text-sm">
              {g('parents_venues', 'Home matches and training take place at Bradwell Park. Away fixture details are shared by team managers ahead of match day.')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <ShieldCheck className="text-primary mb-3" size={28} />
            <h3 className="font-heading text-lg uppercase text-foreground mb-2">Safeguarding</h3>
            <p className="text-muted-foreground text-sm">
              {g('parents_safeguarding', 'The welfare of every child is our priority. All coaches are DBS checked and FA safeguarding trained. Contact our Welfare Officer with any concerns.')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <FileText className="text-primary mb-3" size={28} />
            <h3 className="font-heading text-lg uppercase text-foreground mb-2">Club Policies</h3>
            <p className="text-muted-foreground text-sm">
              {g('parents_club_policies', 'Our code of conduct, anti-bullying policy, and respect programme documents are available from your team manager or the club secretary.')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Clock className="text-primary mb-3" size={28} />
            <h3 className="font-heading text-lg uppercase text-foreground mb-2">Match Days</h3>
            <p className="text-muted-foreground text-sm">
              {g('parents_match_days', 'Please arrive 15 minutes before kick-off. Ensure your child has shin pads, boots, and their kit. We encourage positive touchline behaviour from all supporters.')}
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <Mail className="text-primary mb-3" size={28} />
            <h3 className="font-heading text-lg uppercase text-foreground mb-2">Get In Touch</h3>
            <p className="text-muted-foreground text-sm">
              {g('parents_get_in_touch', 'Questions? Reach out to your team manager directly, or contact the club via our social media channels or email.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
