import { Calendar, MapPin } from "lucide-react";
import { useFixtures } from "@/hooks/use-fixtures";
import type { Fixture } from "@/types";

function FixtureCard({ fixture }: { fixture: Fixture }) {
  const homeTeam = fixture.home ? "Bradwell FC" : fixture.opponent;
  const awayTeam = fixture.home ? fixture.opponent : "Bradwell FC";

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {fixture.competition && (
            <span className="text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              {fixture.competition}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          {new Date(fixture.date).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`font-semibold ${fixture.home ? "text-foreground" : "text-muted-foreground"}`}>
          {homeTeam}
        </span>
        <span className="text-xs text-muted-foreground font-heading uppercase">vs</span>
        <span className={`font-semibold text-right ${!fixture.home ? "text-foreground" : "text-muted-foreground"}`}>
          {awayTeam}
        </span>
      </div>
      {fixture.venue && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
          <MapPin size={12} />
          {fixture.venue}
        </div>
      )}
    </div>
  );
}

function ResultCard({ fixture }: { fixture: Fixture }) {
  const homeTeam = fixture.home ? "Bradwell FC" : fixture.opponent;
  const awayTeam = fixture.home ? fixture.opponent : "Bradwell FC";
  const homeScore = fixture.home
    ? fixture.result!.goals_for
    : fixture.result!.goals_against;
  const awayScore = fixture.home
    ? fixture.result!.goals_against
    : fixture.result!.goals_for;

  return (
    <div className="bg-secondary rounded-lg p-6 text-center mb-3">
      {fixture.competition && (
        <span className="text-xs font-medium uppercase tracking-wider text-primary">
          {fixture.competition}
        </span>
      )}
      <p className="text-xs text-secondary-foreground/60 mt-1 mb-4">
        {new Date(fixture.date).toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
        })}
      </p>
      <div className="flex items-center justify-center gap-6">
        <p className="font-heading text-secondary-foreground text-sm uppercase text-right">
          {homeTeam}
        </p>
        <div className="font-heading text-3xl text-primary">
          {homeScore} - {awayScore}
        </div>
        <p className="font-heading text-secondary-foreground/70 text-sm uppercase text-left">
          {awayTeam}
        </p>
      </div>
      {fixture.venue && (
        <p className="text-xs text-secondary-foreground/50 mt-4 flex items-center justify-center gap-1">
          <MapPin size={12} />
          {fixture.venue}
        </p>
      )}
    </div>
  );
}

export function FixturesPage() {
  const { data: fixtures, isLoading, error } = useFixtures();

  const upcoming = fixtures?.filter((f) => !f.result) ?? [];
  const results = fixtures?.filter((f) => f.result) ?? [];

  return (
    <div className="pt-24 pb-20">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
            Matchday
          </p>
          <h1 className="text-4xl md:text-5xl text-foreground uppercase">
            Fixtures &amp; Results
          </h1>
        </div>

        {isLoading && (
          <p className="text-center text-muted-foreground">Loading fixtures...</p>
        )}
        {error && (
          <p className="text-center text-destructive">Failed to load fixtures.</p>
        )}

        {!isLoading && !error && (
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-heading text-lg uppercase tracking-wider text-muted-foreground mb-4">
                Upcoming
              </h3>
              {upcoming.length === 0 && (
                <p className="text-muted-foreground text-sm">No upcoming fixtures.</p>
              )}
              {upcoming.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>

            <div>
              <h3 className="font-heading text-lg uppercase tracking-wider text-muted-foreground mb-4">
                Latest Results
              </h3>
              {results.length === 0 && (
                <p className="text-muted-foreground text-sm">No results yet.</p>
              )}
              {results.map((fixture) => (
                <ResultCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
