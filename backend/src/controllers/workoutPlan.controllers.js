import WorkoutPlan from "../models/workoutPlan.models.js";

export const saveWorkoutPlan = async (req, res) => {
  try {
    const planPayload = {
      monday: req.body.monday || "",
      tuesday: req.body.tuesday || "",
      wednesday: req.body.wednesday || "",
      thursday: req.body.thursday || "",
      friday: req.body.friday || "",
      saturday: req.body.saturday || "",
      sunday: req.body.sunday || "",
    };

    const plan = await WorkoutPlan.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, ...planPayload },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findOne({ user: req.user._id });

    if (!plan) {
      return res.json({
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
      });
    }

    return res.json(plan);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
