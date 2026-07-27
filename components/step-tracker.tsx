"use client"

import { useMemo, useState } from "react"
import { Footprints, Flame, MapPin, Target, Plus, Trash2, TrendingUp } from "lucide-react"

type Entry = {
  id: string
  label: string
  steps: number
}

// Average stride length in meters, used to estimate distance walked.
const STRIDE_METERS = 0.762

// Calories burned per step scales with body weight.
// ~0.0005 kcal per step per kg is a common walking estimate.
function caloriesForSteps(steps: number, weightKg: number) {
  return steps * weightKg * 0.0005
}

function distanceKm(steps: number) {
  return (steps * STRIDE_METERS) / 1000
}

export function StepTracker() {
  const [weightKg, setWeightKg] = useState(70)
  const [goal, setGoal] = useState(10000)
  const [stepInput, setStepInput] = useState("")
  const [labelInput, setLabelInput] = useState("")
  const [entries, setEntries] = useState<Entry[]>([
    { id: "seed-1", label: "Morning walk", steps: 3200 },
    { id: "seed-2", label: "Errands", steps: 1850 },
  ])

  const totalSteps = useMemo(
    () => entries.reduce((sum, e) => sum + e.steps, 0),
    [entries],
  )

  const totalCalories = caloriesForSteps(totalSteps, weightKg)
  const totalDistance = distanceKm(totalSteps)
  const goalPct = goal > 0 ? Math.min(100, (totalSteps / goal) * 100) : 0

  // Ring geometry for the progress circle.
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (goalPct / 100) * circumference

  function addEntry() {
    const steps = Number.parseInt(stepInput, 10)
    if (!Number.isFinite(steps) || steps <= 0) return
    setEntries((prev) => [
      { id: crypto.randomUUID(), label: labelInput.trim() || "Walk", steps },
      ...prev,
    ])
    setStepInput("")
    setLabelInput("")
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
      addEntry()
    }
  }

  return (
    <section aria-labelledby="steps-heading" className="w-full">
      <div className="mb-6 flex flex-col gap-1">
        <span className="text-sm font-medium text-primary">Daily Activity</span>
        <h2 id="steps-heading" className="text-2xl font-semibold tracking-tight text-balance">
          Steps &amp; Calories Burned
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Log the steps you take throughout the day and WellPulse estimates the calories you burn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Progress ring */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-card-foreground">
          <div className="relative flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="var(--muted)"
                strokeWidth="12"
              />
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <Footprints className="mb-1 size-5 text-primary" aria-hidden="true" />
              <span className="text-3xl font-semibold tabular-nums">
                {totalSteps.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                of {goal.toLocaleString()} steps
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-primary">
            {goalPct.toFixed(0)}% of daily goal
          </p>
        </div>

        {/* Stats + form */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Flame className="size-5" aria-hidden="true" />}
              label="Calories burned"
              value={`${Math.round(totalCalories).toLocaleString()} kcal`}
              tone="accent"
            />
            <StatCard
              icon={<MapPin className="size-5" aria-hidden="true" />}
              label="Distance"
              value={`${totalDistance.toFixed(2)} km`}
              tone="primary"
            />
            <StatCard
              icon={<TrendingUp className="size-5" aria-hidden="true" />}
              label="Entries logged"
              value={`${entries.length}`}
              tone="primary"
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground sm:grid-cols-2">
            <Field label="Body weight (kg)" htmlFor="weight">
              <input
                id="weight"
                type="number"
                min={1}
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(1, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Field label="Daily step goal" htmlFor="goal">
              <input
                id="goal"
                type="number"
                min={1}
                value={goal}
                onChange={(e) => setGoal(Math.max(1, Number(e.target.value) || 0))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
          </div>

          {/* Add entry */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground sm:flex-row sm:items-end">
            <Field label="Activity" htmlFor="label" className="sm:flex-1">
              <input
                id="label"
                type="text"
                placeholder="e.g. Evening walk"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <Field label="Steps" htmlFor="steps" className="sm:w-40">
              <input
                id="steps"
                type="number"
                min={1}
                placeholder="0"
                value={stepInput}
                onChange={(e) => setStepInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <button
              type="button"
              onClick={addEntry}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add steps
            </button>
          </div>
        </div>
      </div>

      {/* Entries list */}
      <div className="mt-6 rounded-xl border border-border bg-card text-card-foreground">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Target className="size-4 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-semibold">Today&apos;s log</h3>
        </div>
        {entries.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No steps logged yet. Add your first walk above.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-primary">
                    <Footprints className="size-4" aria-hidden="true" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{entry.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {entry.steps.toLocaleString()} steps ·{" "}
                      {Math.round(caloriesForSteps(entry.steps, weightKg))} kcal ·{" "}
                      {distanceKm(entry.steps).toFixed(2)} km
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  aria-label={`Remove ${entry.label}`}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone: "primary" | "accent"
}) {
  const toneClass =
    tone === "accent"
      ? "bg-accent/15 text-accent-foreground"
      : "bg-primary/10 text-primary"
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground">
      <span className={`inline-flex size-9 items-center justify-center rounded-lg ${toneClass}`}>
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-lg font-semibold tabular-nums">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
