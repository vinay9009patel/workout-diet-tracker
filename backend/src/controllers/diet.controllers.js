import Diet from "../models/Diet.models.js";

export const createDiet = async (req, res) => {
  try {
    const { mealType, foodName, calories, protein, carbs, fats, date } = req.body;

    if (!mealType || !foodName || calories === undefined) {
      return res.status(400).json({ message: "mealType, foodName and calories are required" });
    }

    const diet = await Diet.create({
      user: req.user._id,
      mealType,
      foodName,
      calories,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      date: date || Date.now(),
    });

    return res.status(201).json(diet);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDiets = async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    return res.json(diets);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateDiet = async (req, res) => {
  try {
    const diet = await Diet.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!diet) {
      return res.status(404).json({ message: "Diet entry not found" });
    }

    return res.json(diet);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!diet) {
      return res.status(404).json({ message: "Diet entry not found" });
    }

    return res.json({ message: "Diet entry deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
