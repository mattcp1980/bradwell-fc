import { ExternalLink, FileText, Calendar, ChevronRight, AlertCircle, Clock, MapPin, HelpCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useCoachDocuments } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { useMyTeamIds } from "@/hooks/use-officials";
import { TrainingScheduleView } from "@/components/shared/training-schedule-view";
import { useRequiredEvents } from "@/hooks/use-events";
import { useFaqs } from "@/hooks/use-faqs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function FaqSection({ audience, title }: { audience: 'coaches' | 'parents'; title: string }) {
  const { data: faqs = [], isLoading } = useFaqs(audience)

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <HelpCircle className="text-primary" size={18} />
        <h2 className="font-heading text-base uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-6 py-2">
        {isLoading && (
          <div className="py-4 space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="space-y-1.5">
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && faqs.length === 0 && (
          <p className="py-8 text-sm text-muted-foreground text-center">
            No FAQs available yet.
          </p>
        )}
        {!isLoading && faqs.length > 0 && (
          <Accordion type="multiple" className="w-full">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-sm text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  )
}

export function ParentDashboard() {
  const { user } = useAuth();
  const { data: myTeamIds } = useMyTeamIds(user?.email);
  const { data: documents = [], isLoading: docsLoading } = useCoachDocuments();
  const { data: requiredEvents = [], isLoading: eventsLoading } = useRequiredEvents();

  // Everyone sees only the teams they are personally assigned to.
  // myTeamIds is undefined while loading, [] once resolved with no assignments.
  const scheduleTeamIds = myTeamIds ?? [];

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="mb-10">
            <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-1">
              Coach
            </p>
            <h1 className="text-4xl md:text-5xl text-foreground uppercase">
              Coach Hub
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Training schedule */}
              <section className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                  <Calendar className="text-primary" size={18} />
                  <h2 className="font-heading text-base uppercase tracking-wider">
                    Training Schedule
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <TrainingScheduleView myTeamIds={scheduleTeamIds} hideUnassigned showFullSchedulePdf />
                </div>
              </section>

              {/* Documents */}
              <section className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                  <FileText className="text-primary" size={18} />
                  <h2 className="font-heading text-base uppercase tracking-wider">
                    Documents
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {docsLoading && (
                    [1, 2, 3].map((n) => (
                      <div key={n} className="px-6 py-4 flex items-center gap-3">
                        <div className="h-4 w-4 bg-muted rounded animate-pulse shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                          <div className="h-2.5 bg-muted rounded animate-pulse w-1/3" />
                        </div>
                      </div>
                    ))
                  )}
                  {!docsLoading && documents.map((doc) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="text-muted-foreground shrink-0" size={16} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doc.category ? `${doc.category} · ` : ''}Added {format(new Date(doc.created_at), 'd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={16} />
                    </a>
                  ))}
                  {!docsLoading && documents.length === 0 && (
                    <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                      No documents available yet.
                    </p>
                  )}
                </div>
              </section>

              {/* Coach FAQs */}
              <FaqSection audience="coaches" title="Coach FAQs" />

              {/* Parent FAQs */}
              <FaqSection audience="parents" title="Parent FAQs" />

            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Required attendance events */}
              <section className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
                  <AlertCircle className="text-primary" size={18} />
                  <h2 className="font-heading text-base uppercase tracking-wider">
                    Required Events
                  </h2>
                </div>
                <div className="divide-y divide-border">
                  {eventsLoading && (
                    [1, 2].map((n) => (
                      <div key={n} className="px-4 py-3 space-y-1.5">
                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                    ))
                  )}
                  {!eventsLoading && requiredEvents.map((event) => (
                    <div key={event.id} className="px-4 py-3">
                      <p className="text-sm font-semibold text-foreground mb-1">{event.title}</p>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar size={11} />
                          <span>{format(parseISO(event.event_date), 'd MMM yyyy')}</span>
                        </div>
                        {(event.start_time || event.end_time) && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock size={11} />
                            <span>
                              {event.start_time ? event.start_time.slice(0, 5) : ''}
                              {event.end_time ? `–${event.end_time.slice(0, 5)}` : ''}
                            </span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin size={11} />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {!eventsLoading && requiredEvents.length === 0 && (
                    <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                      No upcoming required events.
                    </p>
                  )}
                </div>
              </section>

              {/* Hivelink */}
              <a
                href="https://app.hivelink.co.uk/subscription-registers/9311"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-primary/10 border-2 border-primary rounded-lg p-6 hover:bg-primary/20 transition-colors group"
              >
                <ExternalLink className="text-primary mb-3" size={24} />
                <h3 className="font-heading text-base uppercase text-foreground mb-2">
                  Player Registrations &amp; Subs
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Manage player registrations and subscription payments via Hivelink.
                </p>
                <span className="text-primary text-sm font-heading uppercase tracking-wide group-hover:underline">
                  Open Hivelink →
                </span>
              </a>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
