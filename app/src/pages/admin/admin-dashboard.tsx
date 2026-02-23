import { useState } from "react";
import { Newspaper, Calendar, FileText, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminSection = "news" | "training" | "documents";

const placeholderNews = [
  { id: 1, title: "Cup Run Continues with Dominant Win", category: "Match Report", date: "18 Feb 2026", published: true },
  { id: 2, title: "New Training Sessions for Spring Term", category: "Club News", date: "14 Feb 2026", published: true },
  { id: 3, title: "Volunteers Needed for Tournament Day", category: "Events", date: "10 Feb 2026", published: false },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const placeholderTimetable = [
  { id: 1, team: "U10 Reds", day: "Tuesday", time: "18:00", venue: "Bradwell Park, Pitch 1" },
  { id: 2, team: "U10 Blues", day: "Thursday", time: "18:00", venue: "Bradwell Park, Pitch 2" },
  { id: 3, team: "U12 Reds", day: "Wednesday", time: "18:30", venue: "Bradwell Park, Pitch 1" },
  { id: 4, team: "Open Age First Team", day: "Tuesday", time: "19:30", venue: "Bradwell Park, Pitch 1" },
];

const placeholderDocuments = [
  { id: 1, name: "FA Respect Code of Conduct", category: "Policy", audience: "Both", date: "Jan 2026" },
  { id: 2, name: "Safeguarding Policy 2025-26", category: "Policy", audience: "Both", date: "Aug 2025" },
  { id: 3, name: "Emergency Contact Form", category: "Form", audience: "Managers", date: "Aug 2025" },
];

const navItems: { id: AdminSection; label: string; icon: typeof Newspaper }[] = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "training", label: "Training Timetable", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
];

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("news");

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">

          {/* Page header */}
          <div className="mb-8">
            <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-1">
              Dashboard
            </p>
            <h1 className="text-4xl md:text-5xl text-foreground uppercase">
              Club Admin
            </h1>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* Sidebar nav */}
            <nav className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-heading uppercase tracking-wide transition-colors text-left border-b border-border last:border-0 ${
                        activeSection === item.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* Main panel */}
            <div className="lg:col-span-3">

              {/* News */}
              {activeSection === "news" && (
                <section className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-heading text-base uppercase tracking-wider">News Posts</h2>
                    <Button size="sm" className="gap-1.5">
                      <Plus size={14} />
                      New Post
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {placeholderNews.map((post) => (
                      <div key={post.id} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-heading uppercase tracking-wider text-primary">
                              {post.category}
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              post.published
                                ? "bg-green-100 text-green-700"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {post.published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-foreground truncate">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{post.date}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <Pencil size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Training timetable */}
              {activeSection === "training" && (
                <section className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-heading text-base uppercase tracking-wider">Training Timetable</h2>
                    <Button size="sm" className="gap-1.5">
                      <Plus size={14} />
                      Add Session
                    </Button>
                  </div>

                  {/* Group by day */}
                  {days.map((day) => {
                    const sessions = placeholderTimetable.filter((s) => s.day === day);
                    if (sessions.length === 0) return null;
                    return (
                      <div key={day} className="border-b border-border last:border-0">
                        <div className="px-6 py-2 bg-muted/30">
                          <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
                            {day}
                          </p>
                        </div>
                        {sessions.map((session) => (
                          <div key={session.id} className="px-6 py-3 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{session.team}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {session.time} · {session.venue}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Pencil size={14} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </section>
              )}

              {/* Documents */}
              {activeSection === "documents" && (
                <section className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-heading text-base uppercase tracking-wider">Documents</h2>
                    <Button size="sm" className="gap-1.5">
                      <Upload size={14} />
                      Upload
                    </Button>
                  </div>
                  <div className="divide-y divide-border">
                    {placeholderDocuments.map((doc) => (
                      <div key={doc.id} className="px-6 py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="text-muted-foreground shrink-0" size={16} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-muted-foreground">{doc.category}</span>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs font-heading uppercase tracking-wide text-primary">
                                {doc.audience}
                              </span>
                              <span className="text-xs text-muted-foreground">· Added {doc.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
