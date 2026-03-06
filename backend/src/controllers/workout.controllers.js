import Workout from "../models/Workout.models.js";

export const createWorkout = async (req, res) => {
  try {
    const { category, exerciseName, sets, reps, weight, date } = req.body;

    if (!category || !exerciseName || !sets || !reps) {
      return res.status(400).json({ message: "category, exerciseName, sets and reps are required" });
    }

    const workout = await Workout.create({
      user: req.user._id,
      category,
      exerciseName,
      sets,
      reps,
      weight: weight || 0,
      date: date || Date.now(),
    });

    return res.status(201).json(workout);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    return res.json(workouts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
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

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.json(workout);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.json({ message: "Workout deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
