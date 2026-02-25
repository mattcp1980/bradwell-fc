import { useEffect, useRef } from "react";

export function FixturesPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set the league code expected by the FA Full-Time script
    (window as Window & { lrcode?: string }).lrcode = '418972832'

    const script = document.createElement('script')
    script.src = 'https://fulltime.thefa.com/client/api/cs1.js'
    script.async = true
    containerRef.current?.appendChild(script)

    return () => {
      script.remove()
      delete (window as Window & { lrcode?: string }).lrcode
    }
  }, [])

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

        <div className="max-w-5xl mx-auto">
          <div id="lrep418972832" ref={containerRef}>
            <p className="text-muted-foreground text-sm">Loading fixtures...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
