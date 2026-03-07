import { fetchNutritionForFoods } from "./calorieNinjas.service.js";
import { fetchExercisesByBodyPart, inferBodyPartFromSplit } from "./exerciseDb.service.js";
import { generateGeminiJson } from "./gemini.service.js";

const fallbackPlan = {
  weeklyWorkout: [
    {
      day: "Monday",
      split: "Chest + Triceps",
      exercises: [
        { name: "Bench Press", sets: 4, reps: "8-10" },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
      ],
    },
    {
      day: "Tuesday",
      split: "Back + Biceps",
      exercises: [
        { name: "Pull Ups", sets: 4, reps: "8-10" },
        { name: "Barbell Row", sets: 3, reps: "10-12" },
      ],
    },
  ],
  dietPlan: [
    { meal: "Breakfast", item: "Oats with milk and peanut butter" },
    { meal: "Lunch", item: "Brown rice, dal, paneer sabzi" },
    { meal: "Dinner", item: "Roti, tofu/paneer, vegetables" },
    { meal: "Pre Workout", item: "Banana" },
    { meal: "Post Workout", item: "Paneer sandwich" },
  ],
  nutrition: {
    calorieTarget: 2200,
    proteinTarget_g: 120,
    carbsTarget_g: 250,
    fatsTarget_g: 70,
  },
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeAiPlan = (data) => {
  const weeklyWorkout = toArray(data?.weeklyWorkout).map((dayRow) => ({
    day: String(dayRow?.day || "Monday"),
    split: String(dayRow?.split || "Full Body"),
    exercises: toArray(dayRow?.exercises).map((exercise) => ({
      name: String(exercise?.name || "Bodyweight Exercise"),
      sets: Number(exercise?.sets || 3),
      reps: String(exercise?.reps || "10"),
    })),
  }));

  const dietPlan = toArray(data?.dietPlan).map((row) => ({
    meal: String(row?.meal || "Meal"),
    item: String(row?.item || row?.food || "Food item"),
  }));

  const nutrition = {
    calorieTarget: Number(data?.nutrition?.calorieTarget || 2200),
    proteinTarget_g: Number(data?.nutrition?.proteinTarget_g || 120),
    carbsTarget_g: Number(data?.nutrition?.carbsTarget_g || 250),
    fatsTarget_g: Number(data?.nutrition?.fatsTarget_g || 70),
  };

  return {
    weeklyWorkout: weeklyWorkout.length ? weeklyWorkout : fallbackPlan.weeklyWorkout,
    dietPlan: dietPlan.length ? dietPlan : fallbackPlan.dietPlan,
    nutrition,
  };
};

const buildPrompt = ({ userName, message, mode }) => `
You are a professional fitness coach.
User name: ${userName}
User request: ${message}
Mode: ${mode}

Return ONLY valid JSON in this exact structure:
{
 "weeklyWorkout": [
  {
   "day": "Monday",
   "split": "Chest + Triceps",
   "exercises": [
    {"name":"Bench Press","sets":4,"reps":"8-10"}
   ]
  }
 ],
 "dietPlan": [
  {"meal":"Breakfast","item":"Oats with milk and peanut butter"}
 ],
 "nutrition": {
  "calorieTarget": 2200,
  "proteinTarget_g": 120,
  "carbsTarget_g": 250,
  "fatsTarget_g": 70
 }
}

Rules:
- Weekly workout for hypertrophy.
- Vegetarian diet items only.
- Realistic calorie/macro targets.
- Keep content practical and concise.
`;

export const generateIntegratedPlan = async ({ userName, message, mode = "chat" }) => {
  const aiResponse = await generateGeminiJson(buildPrompt({ userName, message, mode }), fallbackPlan);
  const plan = normalizeAiPlan(aiResponse);

  const bodyParts = [...new Set(plan.weeklyWorkout.map((row) => inferBodyPartFromSplit(row.split)))];
  const exerciseResponses = await Promise.all(bodyParts.map((part) => fetchExercisesByBodyPart(part, 8)));
  const exerciseList = exerciseResponses.flat();

  const foodItems = plan.dietPlan.map((row) => row.item);
  const nutritionFromApi = await fetchNutritionForFoods(foodItems);

  return {
    weeklyWorkout: plan.weeklyWorkout,
    exerciseList,
    dietPlan: plan.dietPlan,
    nutrition: {
      estimated: plan.nutrition,
      fromCalorieNinjas: nutritionFromApi,
    },
  };
};
