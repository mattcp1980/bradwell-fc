import { useState, useMemo } from "react";
import { Calendar, MapPin, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Fixture {
  id: number;
  date: string;
  time: string;
  home: string;
  away: string;
  venue: string;
  competition: string;
  ageGroup: string;
  team: string;
  isResult?: boolean;
  homeScore?: number;
  awayScore?: number;
}

const ageGroups = [
  "U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18",
  "Open Age", "Girls", "Disability",
];

const teamsByAgeGroup: Record<string, string[]> = {
  U7: ["Reds", "Blues", "Whites"],
  U8: ["Reds", "Blues", "Whites", "Blacks"],
  U9: ["Reds", "Blues", "Whites"],
  U10: ["Reds", "Blues", "Whites", "Blacks"],
  U11: ["Reds", "Blues", "Whites"],
  U12: ["Reds", "Blues", "Whites", "Blacks"],
  U13: ["Reds", "Blues", "Whites"],
  U14: ["Reds", "Blues", "Whites", "Blacks"],
  U15: ["Reds", "Blues"],
  U16: ["Reds", "Blues"],
  U17: ["Reds"],
  U18: ["Reds", "Blues"],
  "Open Age": ["First Team", "Reserves"],
  Girls: ["Reds", "Blues"],
  Disability: ["Bradwell Ability"],
};

const fixtures: Fixture[] = [
  // U10 Reds
  { id: 1, date: "Sat 1 Mar", time: "10:00", home: "Bradwell FC U10 Reds", away: "Westfield Utd", venue: "Bradwell Park", competition: "League", ageGroup: "U10", team: "Reds" },
  { id: 2, date: "Sat 8 Mar", time: "10:30", home: "Riverside FC", away: "Bradwell FC U10 Reds", venue: "Riverside Ground", competition: "Cup R3", ageGroup: "U10", team: "Reds" },
  { id: 3, date: "Sat 15 Mar", time: "10:00", home: "Bradwell FC U10 Reds", away: "Milton Town", venue: "Bradwell Park", competition: "League", ageGroup: "U10", team: "Reds" },
  { id: 4, date: "Sat 22 Feb", time: "10:00", home: "Bradwell FC U10 Reds", away: "Oakfield Rangers", venue: "Bradwell Park", competition: "League", ageGroup: "U10", team: "Reds", isResult: true, homeScore: 3, awayScore: 1 },
  // U10 Blues
  { id: 5, date: "Sat 1 Mar", time: "11:00", home: "Bradwell FC U10 Blues", away: "Stony Stratford", venue: "Bradwell Park", competition: "League", ageGroup: "U10", team: "Blues" },
  { id: 6, date: "Sat 22 Feb", time: "11:00", home: "Newport FC", away: "Bradwell FC U10 Blues", venue: "Newport Rec", competition: "League", ageGroup: "U10", team: "Blues", isResult: true, homeScore: 1, awayScore: 4 },
  // U12 Reds
  { id: 7, date: "Sat 1 Mar", time: "10:00", home: "Bradwell FC U12 Reds", away: "Wolverton Town", venue: "Bradwell Park", competition: "League", ageGroup: "U12", team: "Reds" },
  { id: 8, date: "Sat 22 Feb", time: "10:00", home: "Bradwell FC U12 Reds", away: "Bletchley Youth", venue: "Bradwell Park", competition: "League", ageGroup: "U12", team: "Reds", isResult: true, homeScore: 2, awayScore: 2 },
  // Open Age First Team
  { id: 9, date: "Sat 1 Mar", time: "14:00", home: "Bradwell FC", away: "MK Wanderers", venue: "Bradwell Park", competition: "League", ageGroup: "Open Age", team: "First Team" },
  { id: 10, date: "Sat 22 Feb", time: "14:00", home: "Bradwell FC", away: "Olney Town", venue: "Bradwell Park", competition: "League", ageGroup: "Open Age", team: "First Team", isResult: true, homeScore: 5, awayScore: 0 },
  // Girls Reds
  { id: 11, date: "Sun 2 Mar", time: "10:00", home: "Bradwell FC Girls", away: "Woughton Girls", venue: "Bradwell Park", competition: "League", ageGroup: "Girls", team: "Reds" },
  // Disability
  { id: 12, date: "Sun 2 Mar", time: "11:00", home: "Bradwell Ability", away: "MK Inclusive", venue: "Bradwell Park", competition: "Friendly", ageGroup: "Disability", team: "Bradwell Ability" },
];

const Fixtures = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");

  const availableTeams = useMemo(() => {
    if (selectedAgeGroup === "all") return [];
    return teamsByAgeGroup[selectedAgeGroup] || [];
  }, [selectedAgeGroup]);

  const filtered = useMemo(() => {
    return fixtures.filter((f) => {
      if (selectedAgeGroup !== "all" && f.ageGroup !== selectedAgeGroup) return false;
      if (selectedTeam !== "all" && f.team !== selectedTeam) return false;
      return true;
    });
  }, [selectedAgeGroup, selectedTeam]);

  const upcoming = filtered.filter((f) => !f.isResult);
  const results = filtered.filter((f) => f.isResult);

  const handleAgeGroupChange = (value: string) => {
    setSelectedAgeGroup(value);
    setSelectedTeam("all");
  };

  return (
    <section id="fixtures" className="py-20 bg-background">
      <div className="container px-4">
        <div className="text-center mb-12">
          <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
            Matchday
          </p>
          <h2 className="text-4xl md:text-5xl text-foreground uppercase">
            Fixtures & Results
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Select value={selectedAgeGroup} onValueChange={handleAgeGroupChange}>
            <SelectTrigger className="w-48 bg-card border-border text-foreground">
              <SelectValue placeholder="All Age Groups" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">All Age Groups</SelectItem>
              {ageGroups.map((ag) => (
                <SelectItem key={ag} value={ag}>
                  {ag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedTeam}
            onValueChange={setSelectedTeam}
            disabled={selectedAgeGroup === "all"}
          >
            <SelectTrigger className="w-48 bg-card border-border text-foreground">
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">All Teams</SelectItem>
              {availableTeams.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Upcoming */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-heading text-lg uppercase tracking-wider text-muted-foreground mb-4">
              Upcoming
            </h3>
            {upcoming.length === 0 && (
              <p className="text-muted-foreground text-sm">No upcoming fixtures for this selection.</p>
            )}
            {upcoming.map((fixture) => (
              <div
                key={fixture.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {fixture.competition}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {fixture.ageGroup} {fixture.team}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    {fixture.date} · {fixture.time}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${fixture.home.includes("Bradwell") ? "text-foreground" : "text-muted-foreground"}`}>
                    {fixture.home}
                  </span>
                  <span className="text-xs text-muted-foreground font-heading uppercase">vs</span>
                  <span className={`font-semibold text-right ${fixture.away.includes("Bradwell") ? "text-foreground" : "text-muted-foreground"}`}>
                    {fixture.away}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                  <MapPin size={12} />
                  {fixture.venue}
                </div>
              </div>
            ))}
          </div>

          {/* Results */}
          <div>
            <h3 className="font-heading text-lg uppercase tracking-wider text-muted-foreground mb-4">
              Latest Results
            </h3>
            {results.length === 0 && (
              <p className="text-muted-foreground text-sm">No results for this selection.</p>
            )}
            {results.map((fixture) => (
              <div
                key={fixture.id}
                className="bg-secondary rounded-lg p-6 text-center mb-3"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">
                    {fixture.competition}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    {fixture.ageGroup} {fixture.team}
                  </span>
                </div>
                <p className="text-xs text-secondary-foreground/60 mt-1 mb-4">
                  {fixture.date}
                </p>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-right">
                    <p className="font-heading text-secondary-foreground text-sm uppercase">
                      {fixture.home}
                    </p>
                  </div>
                  <div className="font-heading text-3xl text-primary">
                    {fixture.homeScore} - {fixture.awayScore}
                  </div>
                  <div className="text-left">
                    <p className="font-heading text-secondary-foreground/70 text-sm uppercase">
                      {fixture.away}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-secondary-foreground/50 mt-4 flex items-center justify-center gap-1">
                  <MapPin size={12} />
                  {fixture.venue}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Fixtures;
