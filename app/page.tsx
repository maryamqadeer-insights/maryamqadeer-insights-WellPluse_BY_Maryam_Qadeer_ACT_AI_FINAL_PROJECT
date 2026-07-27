import { StepTracker } from "@/components/step-tracker"
import { Activity } from "lucide-react"

export default function Page() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-10 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Activity className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight">WellPulse</span>
          <span className="text-xs text-muted-foreground">by Maryam Qadeer</span>
        </div>
      </header>

      <StepTracker />
    </main>
  )
}
