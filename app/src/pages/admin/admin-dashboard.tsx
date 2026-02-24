import { useState } from "react";
import { Newspaper, Calendar, FileText, Plus, Pencil, Trash2, Upload, Users, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OfficialForm } from "@/components/shared/official-form";
import { TeamForm } from "@/components/shared/team-form";
import { NewsForm } from "@/components/shared/news-form";
import { DocumentForm } from "@/components/shared/document-form";
import { useOfficials, useAddOfficial, useUpdateOfficial, useDeleteOfficial } from "@/hooks/use-officials";
import { useTeams, useAddTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/use-teams";
import { useAllNews, useAddNews, useUpdateNews, useDeleteNews } from "@/hooks/use-news";
import { useDocuments, useAddDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import type { ClubOfficial, ClubOfficialInput, TeamInput, TeamWithContact, NewsPost, NewsPostInput, Document, DocumentInput } from "@/types";

type AdminSection = "news" | "training" | "documents" | "officials" | "teams";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const placeholderTimetable = [
  { id: 1, team: "U10 Reds", day: "Tuesday", time: "18:00", venue: "Bradwell Park, Pitch 1" },
  { id: 2, team: "U10 Blues", day: "Thursday", time: "18:00", venue: "Bradwell Park, Pitch 2" },
  { id: 3, team: "U12 Reds", day: "Wednesday", time: "18:30", venue: "Bradwell Park, Pitch 1" },
  { id: 4, team: "Open Age First Team", day: "Tuesday", time: "19:30", venue: "Bradwell Park, Pitch 1" },
];

const navItems: { id: AdminSection; label: string; icon: typeof Newspaper }[] = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "training", label: "Training Timetable", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "teams", label: "Teams", icon: Shield },
  { id: "officials", label: "Club Officials", icon: Users },
];

// ---------------------------------------------------------------------------
// News section
// ---------------------------------------------------------------------------

type StatusBadgeProps = { status: NewsPost['status'] }

function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'published') {
    return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700">Published</span>
  }
  if (status === 'scheduled') {
    return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-amber-100 text-amber-700">Scheduled</span>
  }
  return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">Draft</span>
}

function NewsSection() {
  const { user } = useAuth();
  const { data: posts = [], isLoading } = useAllNews();
  const addNews = useAddNews();
  const updateNews = useUpdateNews();
  const deleteNews = useDeleteNews();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NewsPost | null>(null);

  const authorId = user?.id ?? '';

  function handleAdd(input: NewsPostInput, clientId: string) {
    addNews.mutate({ ...input, id: clientId }, { onSuccess: () => setAddOpen(false) });
  }

  function handleUpdate(input: NewsPostInput) {
    if (!editTarget) return;
    updateNews.mutate({ id: editTarget.id, input }, { onSuccess: () => setEditTarget(null) });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    deleteNews.mutate(id);
  }

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-base uppercase tracking-wider">News Posts</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          New Post
        </Button>
      </div>

      {isLoading && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
      )}
      {!isLoading && posts.length === 0 && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">
          No articles yet. Click "New Post" to get started.
        </p>
      )}
      {!isLoading && posts.length > 0 && (
        <div className="divide-y divide-border">
          {posts.map((post) => (
            <div key={post.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={post.status} />
                  {post.status === 'scheduled' && post.scheduled_at && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(post.scheduled_at), 'd MMM yyyy, HH:mm')}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(post.created_at), 'd MMM yyyy')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditTarget(post)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(post.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New article</DialogTitle>
            <DialogDescription>Write and publish a news article.</DialogDescription>
          </DialogHeader>
          <NewsForm
            authorId={authorId}
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
            isPending={addNews.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit article</DialogTitle>
            <DialogDescription>Update the article details below.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <NewsForm
              defaultValues={editTarget}
              authorId={authorId}
              onSubmit={(input) => handleUpdate(input)}
              onCancel={() => setEditTarget(null)}
              isPending={updateNews.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Teams section
// ---------------------------------------------------------------------------

function TeamsSection() {
  const { data: teams = [], isLoading } = useTeams();
  const addTeam = useAddTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamWithContact | null>(null);

  function handleAdd(input: TeamInput) {
    addTeam.mutate(input, { onSuccess: () => setAddOpen(false) });
  }

  function handleUpdate(input: TeamInput) {
    if (!editTarget) return;
    updateTeam.mutate({ id: editTarget.id, input }, { onSuccess: () => setEditTarget(null) });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this team? This cannot be undone.")) return;
    deleteTeam.mutate(id);
  }

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-base uppercase tracking-wider">Teams</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Add Team
        </Button>
      </div>

      {isLoading && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
      )}
      {!isLoading && teams.length === 0 && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">
          No teams added yet. Click "Add Team" to get started.
        </p>
      )}
      {!isLoading && teams.length > 0 && (
        <div className="divide-y divide-border">
          {teams.map((team) => (
            <div key={team.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">{team.name}</span>
                  <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                    {team.age_group}
                  </span>
                </div>
                {team.primary_contact ? (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Star size={10} className="text-amber-500" />
                    {team.primary_contact.full_name}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No primary contact set</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditTarget(team)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(team.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add team</DialogTitle>
            <DialogDescription>Enter the team details below.</DialogDescription>
          </DialogHeader>
          <TeamForm
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
            isPending={addTeam.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit team</DialogTitle>
            <DialogDescription>Update the team details below.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <TeamForm
              defaultValues={editTarget}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
              isPending={updateTeam.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Officials section
// ---------------------------------------------------------------------------

function OfficialGroup({
  label,
  officials,
  onEdit,
  onDelete,
}: {
  label: string;
  officials: ClubOfficial[];
  onEdit: (o: ClubOfficial) => void;
  onDelete: (id: string) => void;
}) {
  if (officials.length === 0) return null;
  return (
    <div>
      <div className="px-6 py-2 bg-muted/30 border-b border-border">
        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
      <div className="divide-y divide-border">
        {officials.map((official) => (
          <div key={official.id} className="px-6 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{official.full_name}</span>
                {official.is_primary_contact && (
                  <span className="inline-flex items-center gap-1 text-xs font-heading uppercase tracking-wide text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                    <Star size={10} />
                    Primary contact
                  </span>
                )}
              </div>
              {official.teams.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {official.teams.map((team) => (
                    <span key={team} className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                      {team}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {official.email} · {official.mobile}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(official)}
              >
                <Pencil size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(official.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfficialsSection() {
  const { data: officials = [], isLoading } = useOfficials();
  const { data: teams = [] } = useTeams();
  const addOfficial = useAddOfficial();
  const updateOfficial = useUpdateOfficial();
  const deleteOfficial = useDeleteOfficial();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ClubOfficial | null>(null);

  const teamNames = teams.map((t) => t.name);
  const admins = officials.filter((o) => o.role === "admin");
  const coaches = officials.filter((o) => o.role === "coach");

  function handleAdd(input: ClubOfficialInput) {
    addOfficial.mutate(input, { onSuccess: () => setAddOpen(false) });
  }

  function handleUpdate(input: ClubOfficialInput) {
    if (!editTarget) return;
    updateOfficial.mutate({ id: editTarget.id, input }, { onSuccess: () => setEditTarget(null) });
  }

  function handleDelete(id: string) {
    if (!confirm("Remove this official from the club?")) return;
    deleteOfficial.mutate(id);
  }

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-base uppercase tracking-wider">Club Officials</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Add Official
        </Button>
      </div>

      {isLoading && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
      )}
      {!isLoading && (
        <>
          <OfficialGroup label="Admins" officials={admins} onEdit={setEditTarget} onDelete={handleDelete} />
          <OfficialGroup label="Coaches" officials={coaches} onEdit={setEditTarget} onDelete={handleDelete} />
          {officials.length === 0 && (
            <p className="px-6 py-8 text-sm text-muted-foreground text-center">
              No officials added yet. Click "Add Official" to get started.
            </p>
          )}
        </>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add club official</DialogTitle>
            <DialogDescription>Enter the official's details below.</DialogDescription>
          </DialogHeader>
          <OfficialForm
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
            isPending={addOfficial.isPending}
            teams={teamNames}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit official</DialogTitle>
            <DialogDescription>Update the official's details below.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <OfficialForm
              defaultValues={editTarget}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
              isPending={updateOfficial.isPending}
              teams={teamNames}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Documents section
// ---------------------------------------------------------------------------

type AudienceBadgeProps = { audience: Document['audience'] }

function AudienceBadge({ audience }: AudienceBadgeProps) {
  if (audience === 'coaches') {
    return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-purple-100 text-purple-700">Coaches</span>
  }
  if (audience === 'parents') {
    return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-blue-100 text-blue-700">Parents</span>
  }
  if (audience === 'general') {
    return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700">General</span>
  }
  return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">Admin Only</span>
}

function DocumentsSection() {
  const { user } = useAuth();
  const { data: docs = [], isLoading } = useDocuments();
  const addDocument = useAddDocument();
  const deleteDocument = useDeleteDocument();

  const [uploadOpen, setUploadOpen] = useState(false);

  const uploadedBy = user?.id ?? '';

  function handleAdd(input: DocumentInput, id: string) {
    addDocument.mutate({ ...input, id }, { onSuccess: () => setUploadOpen(false) });
  }

  function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;
    deleteDocument.mutate(doc);
  }

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-base uppercase tracking-wider">Documents</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setUploadOpen(true)}>
          <Upload size={14} />
          Upload
        </Button>
      </div>

      {isLoading && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
      )}
      {!isLoading && docs.length === 0 && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">
          No documents uploaded yet. Click "Upload" to add one.
        </p>
      )}
      {!isLoading && docs.length > 0 && (
        <div className="divide-y divide-border">
          {docs.map((doc) => (
            <div key={doc.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="text-muted-foreground shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <AudienceBadge audience={doc.audience} />
                    {doc.category && (
                      <span className="text-xs text-muted-foreground">{doc.category}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      · Added {format(new Date(doc.created_at), 'd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Open document"
                >
                  <FileText size={14} />
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(doc)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document</DialogTitle>
            <DialogDescription>Select a file and set its audience below.</DialogDescription>
          </DialogHeader>
          <DocumentForm
            uploadedBy={uploadedBy}
            onSubmit={handleAdd}
            onCancel={() => setUploadOpen(false)}
            isPending={addDocument.isPending}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main dashboard
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("news");

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">

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
              {activeSection === "news" && <NewsSection />}

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
              {activeSection === "documents" && <DocumentsSection />}

              {/* Teams */}
              {activeSection === "teams" && <TeamsSection />}

              {/* Officials */}
              {activeSection === "officials" && <OfficialsSection />}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
