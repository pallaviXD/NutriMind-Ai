// NutriMind OS — AI Service (calls backend /api/user/chat → Groq Llama 3.3 70B)

export const simulateLocalAI = async (input, context) => {
  const token = localStorage.getItem("nm_token");

  try {
    const res = await fetch("/api/user/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: input, context }),
    });

    const data = await res.json();

    // ─── AI unavailable or server error → surface the error clearly ───────────
    // Do NOT fall back to fake canned responses when the backend returns an error.
    if (!res.ok || data.errorCode) {
      const errorCode = data.errorCode || "UNKNOWN_ERROR";
      console.error(`Chat API error [${errorCode}]:`, data.error);

      return {
        message: `⚠️ ${data.error || "AI is temporarily unavailable. Please try again in a moment."}`,
        isError: true,
        errorCode,
        newCalories: null,
        newMacros: null,
        newMeals: null,
        profileLabel: null,
        riskLevel: null,
        insights: null,
        pantryUpdate: null,
        meta: data.meta || { fallbackUsed: false, providerLatencyMs: 0 },
      };
    }

    return {
      message: data.message || "🤔 No response. Try again!",
      newCalories: data.newCalories || null,
      newMacros: data.newMacros || null,
      newMeals: data.newMeals || null,
      profileLabel: data.profileLabel || null,
      riskLevel: data.riskLevel || null,
      insights: data.insights || null,
      pantryUpdate: data.pantryUpdate || null,
      isError: false,
      meta: data.meta || { fallbackUsed: false, providerLatencyMs: 0 },
    };
  } catch (err) {
    // ─── True network failure (offline, DNS error, etc.) ──────────────────────
    // Only use the offline fallback for genuine network issues, not backend errors.
    console.error("Network error (fetch failed):", err);
    return fallback(input, context);
  }
};

// ─── Offline fallback — ONLY used when fetch itself throws (true network failure)
const FOOD_DB = {
  chicken: { cal: 165, p: 31, c: 0, f: 3.6 },
  rice: { cal: 130, p: 2.7, c: 28, f: 0.3 },
  egg: { cal: 78, p: 6, c: 0.6, f: 5 },
  eggs: { cal: 78, p: 6, c: 0.6, f: 5 },
  oats: { cal: 389, p: 16.9, c: 66.3, f: 6.9 },
  banana: { cal: 105, p: 1.3, c: 27, f: 0.4 },
  apple: { cal: 95, p: 0.5, c: 25, f: 0.3 },
  salmon: { cal: 208, p: 28, c: 0, f: 10 },
  bread: { cal: 79, p: 2.7, c: 15, f: 1 },
  milk: { cal: 61, p: 3.2, c: 4.8, f: 3.3 },
  yogurt: { cal: 100, p: 17, c: 6, f: 0.7 },
  pasta: { cal: 131, p: 5, c: 25, f: 1.1 },
};

const fallback = async (input, context) => {
  await new Promise((r) => setTimeout(r, 600));
  const lower = input.toLowerCase();
  const { calories, macros, meals } = context;

  const base = {
    message: "",
    newMeals: null,
    newCalories: null,
    newMacros: null,
    profileLabel: null,
    riskLevel: null,
    insights: null,
    pantryUpdate: null,
    isError: false,
    meta: { fallbackUsed: true, providerLatencyMs: 0 },
  };

  // Food logging
  if (
    ["ate", "had", "eaten", "consumed", "drank"].some((t) => lower.includes(t))
  ) {
    const key = Object.keys(FOOD_DB).find((k) => lower.includes(k));
    if (key) {
      const food = FOOD_DB[key];
      const amt = parseFloat(lower.match(/(\d+(?:\.\d+)?)/)?.[1] || "100");
      const m = amt / 100;
      const addCal = Math.round(food.cal * m);
      const slot =
        ["breakfast", "lunch", "dinner", "snacks"].find(
          (k) => meals[k].status === "pending",
        ) || "snacks";
      return {
        ...base,
        newCalories: { ...calories, current: calories.current + addCal },
        newMacros: {
          ...macros,
          protein: macros.protein + Math.round(food.p * m),
          carbs: macros.carbs + Math.round(food.c * m),
          fat: macros.fat + Math.round(food.f * m),
        },
        newMeals: {
          [slot]: { title: `${amt}g ${key}`, cal: addCal, status: "completed" },
        },
        message: `✅ Logged **${amt}g of ${key}** → ${addCal} kcal added to ${slot}. _(offline mode)_`,
        riskLevel: "Low",
      };
    }
  }

  return {
    ...base,
    message: `🔌 You appear to be offline. The server couldn't be reached.\n\nYou can still log meals offline:\n• "I ate 200g chicken"\n• "I had 3 eggs for breakfast"`,
    isError: true,
    meta: { fallbackUsed: true, providerLatencyMs: 0 },
  };
};
