import { useState } from "react";
import { Calendar, Clock, MapPin, Mail, FileText, ShieldCheck, CreditCard, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useSiteContent } from "@/hooks/use-site-content";
import { useParentDocuments } from "@/hooks/use-documents";
import { TrainingScheduleView } from "@/components/shared/training-schedule-view";

export function ParentsPage() {
  const { data: content = {} } = useSiteContent();
  const g = (key: string, fallback: string) => content[key] || fallback;
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const { data: documents = [], isLoading: docsLoading } = useParentDocuments();

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
                <TrainingScheduleView teamDropdown hideUnassigned />
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

          <div
            className={`bg-card border border-border rounded-lg transition-all ${docsOpen ? 'md:col-span-2 lg:col-span-3' : ''}`}
          >
            <button
              onClick={() => setDocsOpen((o) => !o)}
              className="w-full text-left p-6 flex items-start justify-between gap-4 group"
            >
              <div>
                <FileText className="text-primary mb-3" size={28} />
                <h3 className="font-heading text-lg uppercase text-foreground mb-2">Club Documents</h3>
                <p className="text-muted-foreground text-sm">
                  {g('parents_club_policies', 'Key club documents including our code of conduct, policies, and forms.')}
                </p>
              </div>
              <span className="text-primary mt-1 shrink-0">
                {docsOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>
            {docsOpen && (
              <div className="border-t border-border">
                {docsLoading && (
                  [1, 2, 3].map((n) => (
                    <div key={n} className="px-6 py-3 flex items-center gap-3 animate-pulse">
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))
                )}
                {!docsLoading && documents.length === 0 && (
                  <p className="px-6 py-4 text-xs text-muted-foreground italic">No documents uploaded yet.</p>
                )}
                {!docsLoading && documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors group border-b border-border/50 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.category ? `${doc.category} · ` : ''}Added {format(new Date(doc.created_at), 'd MMM yyyy')}
                      </p>
                    </div>
                    <ExternalLink size={13} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </a>
                ))}
              </div>
            )}
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
