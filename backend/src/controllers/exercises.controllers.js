import { fetchExercisesByBodyPart } from "../services/exerciseDb.service.js";

export const getExercisesByBodyPart = async (req, res) => {
  const bodyPart = String(req.params.bodyPart || "").trim();

  if (!bodyPart) {
    return res.status(400).json({ message: "bodyPart is required" });
  }

  try {
    console.log("Exercise lookup request", { bodyPart });
    const exercises = await fetchExercisesByBodyPart(bodyPart, 15);
    return res.status(200).json({ bodyPart, exerciseList: exercises });
  } catch (error) {
    console.error("Exercise lookup error:", error?.message || error);
    return res.status(500).json({ message: "Failed to fetch exercises" });
  }
};
