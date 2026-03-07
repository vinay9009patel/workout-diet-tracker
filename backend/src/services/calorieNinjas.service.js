const CALORIE_API_URL = "https://api.calorieninjas.com/v1/nutrition";

const defaultNutritionItem = (food) => ({
  food,
  calories: 0,
  protein_g: 0,
  carbohydrates_total_g: 0,
  fat_total_g: 0,
});

export const fetchNutritionForFood = async (food) => {
  const query = String(food || "").trim();
  if (!query) return defaultNutritionItem(food);

  const apiKey = process.env.CALORIE_NINJAS_API_KEY;
  if (!apiKey) {
    console.warn("Missing CALORIE_NINJAS_API_KEY, returning zero nutrition.");
    return defaultNutritionItem(query);
  }

  try {
    const url = `${CALORIE_API_URL}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-Api-Key": apiKey },
    });

    if (!response.ok) {
      console.error("CalorieNinjas request failed:", response.status, response.statusText);
      return defaultNutritionItem(query);
    }

    const data = await response.json();
    const item = Array.isArray(data?.items) && data.items[0] ? data.items[0] : null;
    if (!item) return defaultNutritionItem(query);

    return {
      food: query,
      calories: Number(item.calories || 0),
      protein_g: Number(item.protein_g || 0),
      carbohydrates_total_g: Number(item.carbohydrates_total_g || 0),
      fat_total_g: Number(item.fat_total_g || 0),
    };
  } catch (error) {
    console.error("CalorieNinjas fetch error:", error?.message || error);
    return defaultNutritionItem(query);
  }
};

export const fetchNutritionForFoods = async (foods) => {
  const uniqueFoods = [...new Set((Array.isArray(foods) ? foods : []).map((food) => String(food || "").trim()).filter(Boolean))];
  const nutritionItems = await Promise.all(uniqueFoods.map((food) => fetchNutritionForFood(food)));

  const totals = nutritionItems.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein_g += item.protein_g;
      acc.carbohydrates_total_g += item.carbohydrates_total_g;
      acc.fat_total_g += item.fat_total_g;
      return acc;
    },
    { calories: 0, protein_g: 0, carbohydrates_total_g: 0, fat_total_g: 0 }
  );

  return { items: nutritionItems, totals };
};
