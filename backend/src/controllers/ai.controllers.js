import { generateIntegratedPlan } from "../services/aiPlanner.service.js";

const toSafeText = (value, fallback = "") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const YES_WORDS = new Set(["yes", "y", "yeah", "yup", "ok", "okay", "sure", "confirm"]);

const parseReps = (value) => {
  const text = String(value ?? "").trim();
  const firstNumber = text.match(/\d+/);
  return firstNumber ? Number(firstNumber[0]) : 10;
};

const toCommandPlan = (weeklyWorkout = []) =>
  weeklyWorkout.map((row) => ({
    day: String(row?.day || "Monday"),
    split: String(row?.split || "Full Body"),
    exercises: (Array.isArray(row?.exercises) ? row.exercises : []).map((exercise) => ({
      name: String(exercise?.name || "Bodyweight Exercise"),
      sets: Number(exercise?.sets || 3),
      reps: parseReps(exercise?.reps),
    })),
  }));

const getCaloriesAndProtein = (message) => {
  const text = String(message || "").toLowerCase();
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|kilogram|kilograms)?/);
  const weight = weightMatch ? Number(weightMatch[1]) : null;

  if (!weight || !Number.isFinite(weight)) {
    return null;
  }

  const maintenance = weight * 30;
  const calories = text.includes("fat loss")
    ? maintenance - 300
    : text.includes("muscle gain")
      ? maintenance + 300
      : maintenance;

  return {
    dailyCalories: Math.round(calories),
    proteinTarget: Math.round(weight * 1.8),
  };
};

const summarizeForChat = (result, userName) => {
  const firstWorkout = result.weeklyWorkout?.[0];
  const firstDiet = result.dietPlan?.[0];
  const calories = result.nutrition?.estimated?.calorieTarget || 2200;

  return `Hey ${userName}! I generated your plan. First workout: ${firstWorkout?.day || "Monday"} (${firstWorkout?.split || "Full Body"}). First meal: ${firstDiet?.meal || "Breakfast"} - ${firstDiet?.item || "N/A"}. Estimated calories: ${calories}.`;
};

export const chatAI = async (req, res) => {
  const userName = toSafeText(req.body?.userName, "User");
  const message = toSafeText(req.body?.message, "");
  const normalizedMessage = message.toLowerCase();
  const confirmAdd = Boolean(req.body?.confirmAdd) || YES_WORDS.has(normalizedMessage);

  if (!message) {
    return res.status(400).json({ reply: "Please enter a message." });
  }

  if (normalizedMessage.includes("diet")) {
    return res.status(200).json({ action: "generate_diet_plan" });
  }

  try {
    console.log("AI chat request", { userName, messageLength: message.length });
    const result = await generateIntegratedPlan({ userName, message, mode: "chat" });
    const commandPlan = toCommandPlan(result.weeklyWorkout);

    if (confirmAdd) {
      return res.status(200).json({
        action: "add_workout_plan",
        plan: commandPlan,
      });
    }

    const computedTargets = getCaloriesAndProtein(message);

    return res.status(200).json({
      action: "preview_workout_plan",
      reply: summarizeForChat(result, userName),
      plan: commandPlan,
      ...(computedTargets || {}),
    });
  } catch (error) {
    console.error("AI chat error:", error?.message || error);
    return res.status(500).json({ reply: "Unable to fetch AI response right now." });
  }
};

export const workoutAI = async (req, res) => {
  const userName = toSafeText(req.body?.userName, "User");
  const day = toSafeText(req.body?.day, "Monday");
  const split = toSafeText(req.body?.split, "Chest + Triceps");
  const message = `Generate workout for ${day} ${split}`;

  try {
    console.log("AI workout request", { userName, day, split });
    const result = await generateIntegratedPlan({ userName, message, mode: "workout" });

    return res.status(200).json({
      reply: `Hey ${userName}! Workout and exercise suggestions are ready.`,
      ...result,
    });
  } catch (error) {
    console.error("AI workout error:", error?.message || error);
    return res.status(500).json({ reply: "Unable to generate workout right now." });
  }
};

export const dietAI = async (req, res) => {
  const userName = toSafeText(req.body?.userName, "User");
  const goal = toSafeText(req.body?.goal, "General fitness");
  const message = `Generate vegetarian diet and calories for ${goal}`;

  try {
    console.log("AI diet request", { userName, goal });
    const result = await generateIntegratedPlan({ userName, message, mode: "diet" });

    return res.status(200).json({
      reply: `Hey ${userName}! Diet plan and nutrition data are ready.`,
      ...result,
    });
  } catch (error) {
    console.error("AI diet error:", error?.message || error);
    return res.status(500).json({ reply: "Unable to generate diet plan right now." });
  }
};
