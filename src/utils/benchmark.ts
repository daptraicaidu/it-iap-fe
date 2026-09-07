// ── 8 Target Benchmark profiles for Radar Chart ──
// [Core Knowledge, Problem Solving, Applied Experience, Logical Articulation, Focus & Completeness]

export const BENCHMARK_MAP: Record<string, number[]> = {
  default: [5.5, 5.0, 4.0, 5.5, 5.5],
  INTERN_FRONTEND: [5.0, 4.5, 3.5, 5.0, 5.5],
  INTERN_BACKEND: [5.5, 5.0, 3.5, 5.0, 5.0],
  INTERN_TESTER: [5.0, 4.5, 3.5, 5.5, 6.0],
  INTERN_DATA_ANALYST: [5.5, 5.0, 3.5, 5.0, 5.5],
  FRESHER_FRONTEND: [6.5, 6.0, 5.0, 6.0, 6.5],
  FRESHER_BACKEND: [7.0, 6.5, 5.0, 6.0, 6.0],
  FRESHER_TESTER: [6.0, 6.0, 5.0, 6.5, 7.0],
  FRESHER_DATA_ANALYST: [6.5, 6.5, 5.0, 6.0, 6.5],
};

/**
 * Normalizes input string (removes accents/spaces/special chars) and matches with benchmark map keys
 */
export const getBenchmarkByTitleOrRole = (titleOrRole?: string | null): number[] => {
  if (!titleOrRole) return BENCHMARK_MAP["default"];

  const normalized = titleOrRole
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "_");

  // Determine Level: FRESHER or INTERN
  const isFresher = normalized.includes("FRESHER");
  const isIntern = normalized.includes("INTERN") || normalized.includes("THUC_TAP");

  // Determine Position: FRONTEND, BACKEND, TESTER, DATA_ANALYST
  let position = "";
  if (normalized.includes("FRONTEND") || normalized.includes("FRONT_END")) {
    position = "FRONTEND";
  } else if (normalized.includes("BACKEND") || normalized.includes("BACK_END")) {
    position = "BACKEND";
  } else if (normalized.includes("TESTER") || normalized.includes("QC") || normalized.includes("QA")) {
    position = "TESTER";
  } else if (
    normalized.includes("DATA_ANALYST") ||
    normalized.includes("DATA") ||
    normalized.includes("ANALYST")
  ) {
    position = "DATA_ANALYST";
  }

  if (isFresher && position) {
    const key = `FRESHER_${position}`;
    if (BENCHMARK_MAP[key]) return BENCHMARK_MAP[key];
  }

  if (isIntern && position) {
    const key = `INTERN_${position}`;
    if (BENCHMARK_MAP[key]) return BENCHMARK_MAP[key];
  }

  // Fallback direct key checking
  for (const key of Object.keys(BENCHMARK_MAP)) {
    if (key === "default") continue;
    const parts = key.split("_");
    if (parts.every((p) => normalized.includes(p))) {
      return BENCHMARK_MAP[key];
    }
  }

  return BENCHMARK_MAP["default"];
};
