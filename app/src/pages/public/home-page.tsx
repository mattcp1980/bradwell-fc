import { Hero } from "@/components/sections/hero";
import { NewsPreview } from "@/components/sections/news-preview";
import { EventsPreview } from "@/components/sections/events-preview";
import { About } from "@/components/sections/about";

export function HomePage() {
  return (
    <>
      <Hero />
      <EventsPreview />
      <NewsPreview />
      <About />
    </>
  );
}
