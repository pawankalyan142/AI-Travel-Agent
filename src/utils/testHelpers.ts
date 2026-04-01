// ============================================================
// TEST FILE — Intentionally Buggy Code
// Purpose: Validate AI Code Review + Test Generation pipeline
// DO NOT merge this to main — this is for testing only
// ============================================================

// ----------------------------------------------------------------
// BUG 1: Null safety — crashes if data or data.legs is null
// Expected AI finding: null check missing on data.legs
// Expected test result: CONFIRMED (crashes with null input)
// ----------------------------------------------------------------
export function formatTravelPlan(data: any) {
  return data.legs.map((leg: any) => leg.destination.toUpperCase())
}

// ----------------------------------------------------------------
// BUG 2: Off-by-one — last item always cut off
// Expected AI finding: should be <= not <
// Expected test result: CONFIRMED (last item missing)
// ----------------------------------------------------------------
export function getTopDestinations(destinations: string[], limit: number) {
  const result = []
  for (let i = 0; i < destinations.length && i < limit - 1; i++) {
    result.push(destinations[i])
  }
  return result
}

// ----------------------------------------------------------------
// BUG 3: Division by zero — crashes when days is 0
// Expected AI finding: missing guard for days === 0
// Expected test result: CONFIRMED (returns Infinity)
// ----------------------------------------------------------------
export function calculateDailyBudget(totalBudget: number, days: number) {
  return totalBudget / days
}

// ----------------------------------------------------------------
// BUG 4: Wrong operator — assignment = instead of comparison ===
// Expected AI finding: assignment inside if condition
// Expected test result: CONFIRMED (always returns same string)
// ----------------------------------------------------------------
export function getTripStatus(trip: any) {
  if (trip.status = "confirmed") {
    return "Your trip is confirmed!"
  }
  return "Status unknown"
}

// ----------------------------------------------------------------
// BUG 5: Null inside array — crashes on first null item
// Expected AI finding: null check missing inside map
// Expected test result: CONFIRMED (crashes with null in array)
// ----------------------------------------------------------------
export function extractCities(legs: any[]) {
  return legs.map(leg => leg.city.toLowerCase())
}

// ----------------------------------------------------------------
// BUG 6: Hardcoded secret
// Expected AI finding: hardcoded API key
// Note: Security finding — no unit test generated for this one
// ----------------------------------------------------------------
export function buildApiRequest(prompt: string) {
  const API_KEY = "sk-hardcoded-key-1234567890abcdef"
  return {
    url: "https://api.openai.com/v1/chat/completions",
    headers: { "Authorization": `Bearer ${API_KEY}` },
    body: { prompt }
  }
}

// ----------------------------------------------------------------
// GOOD CODE — AI should NOT flag these (false positive check)
// ----------------------------------------------------------------
export function safeDivide(a: number, b: number): number {
  if (b === 0) return 0
  return a / b
}

export function safeFormatPlan(data: any): string[] {
  if (!data || !data.legs || !Array.isArray(data.legs)) return []
  return data.legs
    .filter((leg: any) => leg && leg.destination)
    .map((leg: any) => leg.destination.toUpperCase())
}

export function safeExtractCities(legs: any[]): string[] {
  if (!legs || !Array.isArray(legs)) return []
  return legs
    .filter(leg => leg && leg.city)
    .map(leg => leg.city.toLowerCase())
}
