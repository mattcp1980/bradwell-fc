import { useState } from "react";
import { Newspaper, Calendar, FileText, Plus, Pencil, Trash2, Upload, Users, Star, Shield, LayoutTemplate, Save, Loader2, AlertCircle, CalendarDays, ChevronDown, ChevronUp, Copy, Bell } from "lucide-react";
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
import { TrainingScheduleBuilder } from "@/components/shared/training-schedule-builder";
import { EventForm } from "@/components/shared/event-form";
import { NotifyModal } from "@/components/shared/notify-modal";
import { useOfficials, useAddOfficial, useUpdateOfficial, useDeleteOfficial } from "@/hooks/use-officials";
import { useTeams, useAddTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/use-teams";
import { useAllNews, useAddNews, useUpdateNews, useDeleteNews } from "@/hooks/use-news";
import { useDocuments, useAddDocument, useDeleteDocument } from "@/hooks/use-documents";
import { useSiteContent, useUpdateSiteContent } from "@/hooks/use-site-content";
import { useAllEvents, useAddEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/use-events";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import type { ClubOfficial, ClubOfficialInput, TeamInput, TeamWithContact, NewsPost, NewsPostInput, Document, DocumentInput, ClubEvent, ClubEventInput } from "@/types";

type AdminSection = "news" | "events" | "training" | "documents" | "officials" | "teams" | "site-content";


const navItems: { id: AdminSection; label: string; icon: typeof Newspaper }[] = [
  { id: "news", label: "News", icon: Newspaper },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "training", label: "Training Timetable", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "teams", label: "Teams", icon: Shield },
  { id: "officials", label: "Club Officials", icon: Users },
  { id: "site-content", label: "Site Content", icon: LayoutTemplate },
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
  const [cloneSource, setCloneSource] = useState<NewsPost | null>(null);
  const [notifyTarget, setNotifyTarget] = useState<NewsPost | null>(null);

  const authorId = user?.id ?? '';

  function handleAdd(input: NewsPostInput, clientId: string) {
    addNews.mutate({ ...input, id: clientId }, { onSuccess: () => setAddOpen(false) });
  }

  function handleUpdate(input: NewsPostInput) {
    if (!editTarget) return;
    updateNews.mutate({ id: editTarget.id, input }, { onSuccess: () => setEditTarget(null) });
  }

  function handleClone(input: NewsPostInput, clientId: string) {
    addNews.mutate({ ...input, id: clientId }, { onSuccess: () => setCloneSource(null) });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    deleteNews.mutate(id);
  }

  // Build a synthetic NewsPost for the clone dialog — fresh ID, draft status, prefixed title
  const cloneDefaults: NewsPost | undefined = cloneSource
    ? { ...cloneSource, id: crypto.randomUUID(), title: `Copy of ${cloneSource.title}`, status: 'draft', scheduled_at: null }
    : undefined;

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
                  title="Duplicate"
                  onClick={() => setCloneSource(post)}
                >
                  <Copy size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Send notification"
                  onClick={() => setNotifyTarget(post)}
                >
                  <Bell size={14} />
                </Button>
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

      <Dialog open={!!cloneSource} onOpenChange={(open) => { if (!open) setCloneSource(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Duplicate article</DialogTitle>
            <DialogDescription>A copy has been pre-filled below — edit as needed before saving.</DialogDescription>
          </DialogHeader>
          {cloneDefaults && (
            <NewsForm
              defaultValues={cloneDefaults}
              authorId={authorId}
              onSubmit={handleClone}
              onCancel={() => setCloneSource(null)}
              isPending={addNews.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {notifyTarget && (
        <NotifyModal
          open={!!notifyTarget}
          onClose={() => setNotifyTarget(null)}
          contentType="news"
          contentId={notifyTarget.id}
          contentTitle={notifyTarget.title}
          contentSummary={notifyTarget.excerpt}
          contentUrl={`${window.location.origin}/news/${notifyTarget.id}`}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Teams section
// ---------------------------------------------------------------------------

function TeamsSection() {
  const { data: teams = [], isLoading } = useTeams();
  const { data: officials = [] } = useOfficials();
  const addTeam = useAddTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TeamWithContact | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  // Build a map of team name → all assigned coaches (non-primary included)
  const coachesByTeam = new Map<string, ClubOfficial[]>();
  for (const official of officials) {
    for (const teamName of official.teams) {
      const list = coachesByTeam.get(teamName) ?? [];
      list.push(official);
      coachesByTeam.set(teamName, list);
    }
  }

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
          {teams.map((team) => {
            const isExpanded = expandedTeamId === team.id;
            const allCoaches = coachesByTeam.get(team.name) ?? [];
            return (
              <div key={team.id}>
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <button
                    className="min-w-0 text-left flex-1"
                    onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{team.name}</span>
                      <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5">
                        {team.age_group}
                      </span>
                      {allCoaches.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      )}
                    </div>
                    {team.primary_contact ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Star size={10} className="text-amber-500" />
                        {team.primary_contact.full_name}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">No primary contact set</p>
                    )}
                  </button>
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
                {isExpanded && (
                  <div className="px-6 pb-4 border-t border-border pt-3 bg-muted/20">
                    <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">All coaches</p>
                    {allCoaches.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No coaches assigned.</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {allCoaches.map((coach) => (
                          <div key={coach.id} className="flex items-center gap-2 text-xs text-foreground">
                            {coach.id === team.primary_contact?.id
                              ? <Star size={10} className="text-amber-500 shrink-0" />
                              : <span className="w-2.5 shrink-0" />
                            }
                            <span>{coach.full_name}</span>
                            <span className="text-muted-foreground">{coach.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
  const [notifyDoc, setNotifyDoc] = useState<Document | null>(null);

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
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Send notification"
                  onClick={() => setNotifyDoc(doc)}
                >
                  <Bell size={14} />
                </Button>
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

      {notifyDoc && (
        <NotifyModal
          open={!!notifyDoc}
          onClose={() => setNotifyDoc(null)}
          contentType="document"
          contentId={notifyDoc.id}
          contentTitle={notifyDoc.name}
          contentSummary={notifyDoc.category ? `Category: ${notifyDoc.category}` : undefined}
          contentUrl={notifyDoc.file_url}
        />
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Events section
// ---------------------------------------------------------------------------

function EventStatusBadge({ status }: { status: ClubEvent['status'] }) {
  if (status === 'published') {
    return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-green-100 text-green-700">Published</span>
  }
  return <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-muted text-muted-foreground">Draft</span>
}

function EventsSection() {
  const { user } = useAuth()
  const { data: events = [], isLoading } = useAllEvents()
  const addEvent = useAddEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const [addOpen, setAddOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<ClubEvent | null>(null)
  const [cloneSource, setCloneSource] = useState<ClubEvent | null>(null)
  const [notifyEvent, setNotifyEvent] = useState<ClubEvent | null>(null)

  const createdBy = user?.id ?? ''

  function handleAdd(input: ClubEventInput) {
    addEvent.mutate(input, { onSuccess: () => setAddOpen(false) })
  }

  function handleUpdate(input: ClubEventInput) {
    if (!editTarget) return
    updateEvent.mutate({ id: editTarget.id, input }, { onSuccess: () => setEditTarget(null) })
  }

  function handleClone(input: ClubEventInput) {
    addEvent.mutate(input, { onSuccess: () => setCloneSource(null) })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return
    deleteEvent.mutate(id)
  }

  const cloneDefaults: ClubEvent | undefined = cloneSource
    ? { ...cloneSource, id: crypto.randomUUID(), title: `Copy of ${cloneSource.title}`, status: 'draft' }
    : undefined

  return (
    <section className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="font-heading text-base uppercase tracking-wider">Events</h2>
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Add Event
        </Button>
      </div>

      {isLoading && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
      )}
      {!isLoading && events.length === 0 && (
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">
          No events yet. Click "Add Event" to get started.
        </p>
      )}
      {!isLoading && events.length > 0 && (
        <div className="divide-y divide-border">
          {events.map((event) => (
            <div key={event.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <EventStatusBadge status={event.status} />
                  {event.required_attendance && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">
                      <AlertCircle size={10} />
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {format(parseISO(event.event_date), 'd MMM yyyy')}
                  {event.location ? ` · ${event.location}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Duplicate"
                  onClick={() => setCloneSource(event)}
                >
                  <Copy size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Send notification"
                  onClick={() => setNotifyEvent(event)}
                >
                  <Bell size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setEditTarget(event)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(event.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add event</DialogTitle>
            <DialogDescription>Create a new club event.</DialogDescription>
          </DialogHeader>
          <EventForm
            createdBy={createdBy}
            onSubmit={handleAdd}
            onCancel={() => setAddOpen(false)}
            isPending={addEvent.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
            <DialogDescription>Update the event details below.</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <EventForm
              defaultValues={editTarget}
              createdBy={createdBy}
              onSubmit={handleUpdate}
              onCancel={() => setEditTarget(null)}
              isPending={updateEvent.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!cloneSource} onOpenChange={(open) => { if (!open) setCloneSource(null) }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Duplicate event</DialogTitle>
            <DialogDescription>A copy has been pre-filled below — edit as needed before saving.</DialogDescription>
          </DialogHeader>
          {cloneDefaults && (
            <EventForm
              defaultValues={cloneDefaults}
              createdBy={createdBy}
              onSubmit={handleClone}
              onCancel={() => setCloneSource(null)}
              isPending={addEvent.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {notifyEvent && (
        <NotifyModal
          open={!!notifyEvent}
          onClose={() => setNotifyEvent(null)}
          contentType="event"
          contentId={notifyEvent.id}
          contentTitle={notifyEvent.title}
          contentSummary={[
            format(parseISO(notifyEvent.event_date), 'EEEE d MMMM yyyy'),
            notifyEvent.start_time
              ? notifyEvent.end_time
                ? `${notifyEvent.start_time.slice(0, 5)}–${notifyEvent.end_time.slice(0, 5)}`
                : notifyEvent.start_time.slice(0, 5)
              : null,
            notifyEvent.location || null,
            notifyEvent.description || null,
          ].filter(Boolean).join(' · ')}
          contentUrl={`https://bradwellfc.online`}
        />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Site content section
// ---------------------------------------------------------------------------

type ContentFieldProps = {
  label: string
  contentKey: string
  value: string
  multiline?: boolean
}

function ContentField({ label, contentKey, value, multiline = false }: ContentFieldProps) {
  const [draft, setDraft] = useState(value)
  const [saved, setSaved] = useState(false)
  const updateContent = useUpdateSiteContent()

  // Sync draft when parent value changes (e.g. after refetch)
  if (draft === '' && value !== '') {
    setDraft(value)
  }

  function handleSave() {
    updateContent.mutate({ key: contentKey, value: draft }, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      },
    })
  }

  const isDirty = draft !== value

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          rows={3}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      )}
      <div className="flex items-center justify-end gap-2">
        {saved && (
          <span className="text-xs text-green-600">Saved</span>
        )}
        <Button
          size="sm"
          variant={isDirty ? "default" : "outline"}
          disabled={!isDirty || updateContent.isPending}
          onClick={handleSave}
          className="gap-1.5 h-7 text-xs"
        >
          {updateContent.isPending ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Save size={12} />
          )}
          Save
        </Button>
      </div>
    </div>
  )
}

function SiteContentSection() {
  const { data: content = {}, isLoading } = useSiteContent()

  if (isLoading) {
    return (
      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-base uppercase tracking-wider">Site Content</h2>
        </div>
        <p className="px-6 py-8 text-sm text-muted-foreground text-center">Loading…</p>
      </section>
    )
  }

  const g = (key: string) => content[key] ?? ''

  return (
    <div className="flex flex-col gap-6">

      {/* About section */}
      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-base uppercase tracking-wider">About Section</h2>
          <p className="text-xs text-muted-foreground mt-1">Displayed on the home page "More Than A Club" section.</p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <ContentField label="Heading" contentKey="about_heading" value={g('about_heading')} />
          <ContentField label="First paragraph" contentKey="about_body_1" value={g('about_body_1')} multiline />
          <ContentField label="Second paragraph" contentKey="about_body_2" value={g('about_body_2')} multiline />
          <div className="border-t border-border pt-5">
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-4">Value Cards</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <ContentField label="Community" contentKey="about_value_community" value={g('about_value_community')} multiline />
              <ContentField label="Development" contentKey="about_value_development" value={g('about_value_development')} multiline />
              <ContentField label="Enjoyment" contentKey="about_value_enjoyment" value={g('about_value_enjoyment')} multiline />
              <ContentField label="Respect" contentKey="about_value_respect" value={g('about_value_respect')} multiline />
            </div>
          </div>
        </div>
      </section>

      {/* Parents page */}
      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-base uppercase tracking-wider">Parents Page Cards</h2>
          <p className="text-xs text-muted-foreground mt-1">Info cards shown on the Parents page.</p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <ContentField label="Training Times" contentKey="parents_training_times" value={g('parents_training_times')} multiline />
          <ContentField label="Venues" contentKey="parents_venues" value={g('parents_venues')} multiline />
          <ContentField label="Safeguarding" contentKey="parents_safeguarding" value={g('parents_safeguarding')} multiline />
          <ContentField label="Club Policies" contentKey="parents_club_policies" value={g('parents_club_policies')} multiline />
          <ContentField label="Match Days" contentKey="parents_match_days" value={g('parents_match_days')} multiline />
          <ContentField label="Get In Touch" contentKey="parents_get_in_touch" value={g('parents_get_in_touch')} multiline />
          <ContentField label="Make a Payment URL" contentKey="parents_make_a_payment_url" value={g('parents_make_a_payment_url')} />
        </div>
      </section>

      {/* Footer / contact */}
      <section className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-heading text-base uppercase tracking-wider">Contact &amp; Footer</h2>
          <p className="text-xs text-muted-foreground mt-1">Shown in the site footer and Parents page Get In Touch card.</p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-5">
          <ContentField label="Email address" contentKey="contact_email" value={g('contact_email')} />
          <ContentField label="Address" contentKey="contact_address" value={g('contact_address')} />
          <ContentField label="Footer tagline" contentKey="footer_tagline" value={g('footer_tagline')} multiline />
          <ContentField label="Facebook page URL" contentKey="social_facebook" value={g('social_facebook')} />
          <ContentField label="Instagram profile URL" contentKey="social_instagram" value={g('social_instagram')} />
        </div>
      </section>

    </div>
  )
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

              {/* Events */}
              {activeSection === "events" && <EventsSection />}

              {/* Training timetable */}
              {activeSection === "training" && (
                <section className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-heading text-base uppercase tracking-wider">Training Schedule</h2>
                  </div>
                  <div className="px-6 py-5">
                    <TrainingScheduleBuilder />
                  </div>
                </section>
              )}

              {/* Documents */}
              {activeSection === "documents" && <DocumentsSection />}

              {/* Teams */}
              {activeSection === "teams" && <TeamsSection />}

              {/* Officials */}
              {activeSection === "officials" && <OfficialsSection />}

              {/* Site content */}
              {activeSection === "site-content" && <SiteContentSection />}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
