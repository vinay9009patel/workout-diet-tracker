import mongoose from "mongoose";

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    monday: { type: String, default: "" },
    tuesday: { type: String, default: "" },
    wednesday: { type: String, default: "" },
    thursday: { type: String, default: "" },
    friday: { type: String, default: "" },
    saturday: { type: String, default: "" },
    sunday: { type: String, default: "" },
  },
  { timestamps: true }
);

const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);

export default WorkoutPlan;
