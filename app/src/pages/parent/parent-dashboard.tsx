import { ExternalLink, FileText, Calendar, ChevronRight } from "lucide-react";

const placeholderDocuments = [
  { id: 1, name: "FA Respect Code of Conduct", category: "Policy", date: "Jan 2026" },
  { id: 2, name: "Safeguarding Policy 2025-26", category: "Policy", date: "Aug 2025" },
  { id: 3, name: "Emergency Contact Form", category: "Form", date: "Aug 2025" },
];

const placeholderSchedule = [
  { team: "U10 Reds", day: "Tuesday", time: "18:00", venue: "Bradwell Park, Pitch 1" },
  { team: "U10 Blues", day: "Thursday", time: "18:00", venue: "Bradwell Park, Pitch 2" },
  { team: "U12 Reds", day: "Wednesday", time: "18:30", venue: "Bradwell Park, Pitch 1" },
];

export function ParentDashboard() {
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
                  {placeholderDocuments.map((doc) => (
                    <div key={doc.id} className="px-6 py-4 flex items-center justify-between group hover:bg-muted/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <FileText className="text-muted-foreground shrink-0" size={16} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doc.category} · Added {doc.date}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={16} />
                    </div>
                  ))}
                  {placeholderDocuments.length === 0 && (
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
