const EXERCISE_DB_BASE_URL = "https://exercisedb.p.rapidapi.com";

const normalizeBodyPart = (bodyPart) => {
  const key = String(bodyPart || "").trim().toLowerCase();
  if (!key) return "chest";
  if (key.includes("shoulder")) return "shoulders";
  if (key.includes("arm") || key.includes("bicep") || key.includes("tricep")) return "upper arms";
  if (key.includes("leg") || key.includes("quad") || key.includes("hamstring")) return "upper legs";
  return key;
};

export const inferBodyPartFromSplit = (split) => {
  const text = String(split || "").toLowerCase();
  if (text.includes("chest")) return "chest";
  if (text.includes("back")) return "back";
  if (text.includes("shoulder")) return "shoulders";
  if (text.includes("arm") || text.includes("bicep") || text.includes("tricep")) return "upper arms";
  if (text.includes("leg")) return "upper legs";
  if (text.includes("abs") || text.includes("core")) return "waist";
  return "chest";
};

export const fetchExercisesByBodyPart = async (bodyPart, limit = 10) => {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost = process.env.RAPIDAPI_HOST || "exercisedb.p.rapidapi.com";
  const normalized = normalizeBodyPart(bodyPart);

  if (!rapidApiKey) {
    console.warn("Missing RAPIDAPI_KEY, returning empty exercise list.");
    return [];
  }

  try {
    const url = `${EXERCISE_DB_BASE_URL}/exercises/bodyPart/${encodeURIComponent(normalized)}?limit=${limit}&offset=0`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": rapidApiKey,
        "X-RapidAPI-Host": rapidApiHost,
      },
    });

    if (!response.ok) {
      console.error("ExerciseDB request failed:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, limit).map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      target: exercise.target,
      equipment: exercise.equipment,
      gifUrl: exercise.gifUrl,
    }));
  } catch (error) {
    console.error("ExerciseDB fetch error:", error?.message || error);
    return [];
  }
};
