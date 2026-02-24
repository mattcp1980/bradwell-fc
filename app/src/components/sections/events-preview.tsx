import { format, parseISO } from 'date-fns'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { useUpcomingEvents } from '@/hooks/use-events'

export function EventsPreview() {
  const { data: events = [], isLoading } = useUpcomingEvents()

  if (!isLoading && events.length === 0) return null

  return (
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <p className="font-heading text-primary uppercase tracking-[0.2em] text-sm mb-2">
              What&apos;s On
            </p>
            <h2 className="text-3xl md:text-4xl text-foreground uppercase">
              Upcoming Events
            </h2>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-card border border-border rounded-lg p-5 space-y-3 animate-pulse">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => {
                const date = parseISO(event.event_date)
                return (
                  <div key={event.id} className="bg-card border border-border rounded-lg p-5 flex flex-col gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                        <Calendar size={13} />
                        <span className="text-xs font-heading uppercase tracking-wider">
                          {format(date, 'EEE d MMM yyyy')}
                        </span>
                      </div>
                      <h3 className="font-heading text-base uppercase text-foreground">{event.title}</h3>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                    )}

                    <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-border">
                      {(event.start_time || event.end_time) && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock size={12} />
                          <span>
                            {event.start_time ? event.start_time.slice(0, 5) : ''}
                            {event.end_time ? `–${event.end_time.slice(0, 5)}` : ''}
                          </span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={12} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
