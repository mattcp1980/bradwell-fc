import { ExternalLink, FileText, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useParentDocuments } from "@/hooks/use-documents";

const placeholderSchedule = [
  { team: "U10 Reds", day: "Tuesday", time: "18:00", venue: "Bradwell Park, Pitch 1" },
  { team: "U10 Blues", day: "Thursday", time: "18:00", venue: "Bradwell Park, Pitch 2" },
  { team: "U12 Reds", day: "Wednesday", time: "18:30", venue: "Bradwell Park, Pitch 1" },
];

export function ParentDashboard() {
  const { data: documents = [], isLoading: docsLoading } = useParentDocuments();

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="mb-10">
            <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-1">
              Portal
            </p>
            <h1 className="text-4xl md:text-5xl text-foreground uppercase">
              Manager Hub
            </h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Training schedule */}
              <section className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-primary" size={18} />
                    <h2 className="font-heading text-base uppercase tracking-wider">
                      Training Schedule
                    </h2>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {placeholderSchedule.map((session) => (
                    <div key={session.team} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{session.team}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {session.day} · {session.time} · {session.venue}
                        </p>
                      </div>
                    </div>
                  ))}
                  {placeholderSchedule.length === 0 && (
                    <p className="px-6 py-8 text-sm text-muted-foreground text-center">
                      No training sessions scheduled yet.
                    </p>
                  )}
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

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
