import { useState } from "react";
import api from "../api/axios.js";
import "../styles/aiwidget.css";

const GOALS = ["muscle gain", "fat loss"];
const YES_WORDS = new Set(["yes", "y", "yeah", "yup", "ok", "okay", "sure"]);
const NO_WORDS = new Set(["no", "n", "nope", "cancel"]);
const GENDERS = ["male", "female"];

const normalizeGoal = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (GOALS.includes(text)) return text;
  if (text.includes("muscle")) return "muscle gain";
  if (text.includes("fat")) return "fat loss";
  return "";
};

const splitToCategory = (split) => {
  const text = String(split || "").toLowerCase();
  if (text.includes("chest")) return "Chest";
  if (text.includes("back")) return "Back";
  if (text.includes("shoulder")) return "Shoulder";
  if (text.includes("leg")) return "Legs";
  if (text.includes("triceps")) return "Triceps";
  if (text.includes("biceps")) return "Biceps";
  if (text.includes("abs") || text.includes("core")) return "Abs";
  return "Arms";
};

const toDayPlan = (days) => {
  const templates = {
    1: [{ day: "Monday", split: "Full Body" }],
    2: [
      { day: "Monday", split: "Upper Body" },
      { day: "Thursday", split: "Lower Body + Core" },
    ],
    3: [
      { day: "Monday", split: "Push" },
      { day: "Wednesday", split: "Pull" },
      { day: "Friday", split: "Legs + Core" },
    ],
    4: [
      { day: "Monday", split: "Chest + Triceps" },
      { day: "Tuesday", split: "Back + Biceps" },
      { day: "Thursday", split: "Legs" },
      { day: "Saturday", split: "Shoulders + Core" },
    ],
    5: [
      { day: "Monday", split: "Chest + Triceps" },
      { day: "Tuesday", split: "Back + Biceps" },
      { day: "Wednesday", split: "Legs" },
      { day: "Friday", split: "Shoulders" },
      { day: "Saturday", split: "Arms + Core" },
    ],
    6: [
      { day: "Monday", split: "Chest + Triceps" },
      { day: "Tuesday", split: "Back + Biceps" },
      { day: "Wednesday", split: "Legs" },
      { day: "Thursday", split: "Shoulders" },
      { day: "Friday", split: "Arms + Core" },
      { day: "Saturday", split: "Full Body Light" },
    ],
    7: [
      { day: "Monday", split: "Chest + Triceps" },
      { day: "Tuesday", split: "Back + Biceps" },
      { day: "Wednesday", split: "Legs" },
      { day: "Thursday", split: "Shoulders" },
      { day: "Friday", split: "Arms + Core" },
      { day: "Saturday", split: "Full Body Light" },
      { day: "Sunday", split: "Mobility + Core" },
    ],
  };

  return templates[days] || templates[4];
};

const getExercises = (split) => {
  const library = {
    "Chest + Triceps": [
      { name: "Bench Press", sets: 3, reps: 8 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Push-Ups", sets: 2, reps: 12 },
      { name: "Rope Triceps Pushdown", sets: 3, reps: 12 },
    ],
    "Back + Biceps": [
      { name: "Lat Pulldown", sets: 3, reps: 10 },
      { name: "Seated Cable Row", sets: 3, reps: 10 },
      { name: "One-Arm Dumbbell Row", sets: 2, reps: 12 },
      { name: "Dumbbell Curl", sets: 3, reps: 12 },
    ],
    Legs: [
      { name: "Goblet Squat", sets: 3, reps: 10 },
      { name: "Romanian Deadlift (Dumbbell)", sets: 3, reps: 10 },
      { name: "Leg Press", sets: 3, reps: 12 },
      { name: "Standing Calf Raise", sets: 3, reps: 15 },
    ],
    "Shoulders + Core": [
      { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 },
      { name: "Dumbbell Lateral Raise", sets: 3, reps: 12 },
      { name: "Rear Delt Fly", sets: 2, reps: 12 },
      { name: "Plank", sets: 3, reps: 45 },
    ],
    Shoulders: [
      { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 },
      { name: "Dumbbell Lateral Raise", sets: 3, reps: 12 },
      { name: "Rear Delt Fly", sets: 2, reps: 12 },
      { name: "Face Pull", sets: 2, reps: 12 },
    ],
    "Arms + Core": [
      { name: "Dumbbell Curl", sets: 3, reps: 12 },
      { name: "Hammer Curl", sets: 3, reps: 12 },
      { name: "Overhead Triceps Extension", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, reps: 45 },
    ],
    Push: [
      { name: "Bench Press", sets: 3, reps: 8 },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Rope Triceps Pushdown", sets: 3, reps: 12 },
    ],
    Pull: [
      { name: "Lat Pulldown", sets: 3, reps: 10 },
      { name: "Seated Cable Row", sets: 3, reps: 10 },
      { name: "One-Arm Dumbbell Row", sets: 2, reps: 12 },
      { name: "Dumbbell Curl", sets: 3, reps: 12 },
    ],
    "Legs + Core": [
      { name: "Goblet Squat", sets: 3, reps: 10 },
      { name: "Romanian Deadlift (Dumbbell)", sets: 3, reps: 10 },
      { name: "Leg Press", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, reps: 45 },
    ],
    "Full Body": [
      { name: "Goblet Squat", sets: 3, reps: 10 },
      { name: "Bench Press", sets: 3, reps: 8 },
      { name: "Seated Cable Row", sets: 3, reps: 10 },
      { name: "Dumbbell Shoulder Press", sets: 2, reps: 10 },
    ],
    "Upper Body": [
      { name: "Bench Press", sets: 3, reps: 8 },
      { name: "Lat Pulldown", sets: 3, reps: 10 },
      { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 },
      { name: "Dumbbell Curl", sets: 2, reps: 12 },
    ],
    "Lower Body + Core": [
      { name: "Goblet Squat", sets: 3, reps: 10 },
      { name: "Romanian Deadlift (Dumbbell)", sets: 3, reps: 10 },
      { name: "Leg Press", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, reps: 45 },
    ],
    "Full Body Light": [
      { name: "Bodyweight Squat", sets: 3, reps: 15 },
      { name: "Push-Ups", sets: 3, reps: 12 },
      { name: "Lat Pulldown", sets: 3, reps: 12 },
      { name: "Bird Dog", sets: 2, reps: 10 },
    ],
    "Mobility + Core": [
      { name: "Hip Mobility Flow", sets: 2, reps: 10 },
      { name: "Thoracic Rotation", sets: 2, reps: 10 },
      { name: "Dead Bug", sets: 3, reps: 10 },
      { name: "Plank", sets: 3, reps: 45 },
    ],
  };

  return library[split] || library["Full Body"];
};

const buildWorkoutPlan = (days) =>
  toDayPlan(days).map((row) => ({
    ...row,
    exercises: getExercises(row.split),
  }));

const formatWorkoutPlanText = (plan) =>
  plan
    .map((row) => {
      const lines = row.exercises
        .map((ex) => `- ${ex.name}: ${ex.sets} sets x ${ex.reps} reps`)
        .join("\n");
      return `${row.day} - ${row.split}\n${lines}`;
    })
    .join("\n\n");

const isYesResponse = (text) => {
  const tokens = String(text || "")
    .toLowerCase()
    .split(/[\s,!.?]+/)
    .filter(Boolean);
  return tokens.some((token) => YES_WORDS.has(token));
};

const buildDietEntries = (calories, proteinTarget) => {
  const breakfastCal = Math.round(calories * 0.25);
  const lunchCal = Math.round(calories * 0.3);
  const dinnerCal = Math.round(calories * 0.25);
  const preCal = Math.round(calories * 0.1);
  const postCal = Math.round(calories * 0.1);

  return [
    {
      mealType: "breakfast",
      foodName: "Oats + milk + chia + banana",
      calories: breakfastCal,
      protein: Math.round(proteinTarget * 0.22),
      carbs: Math.round(breakfastCal * 0.5 / 4),
      fats: Math.round(breakfastCal * 0.25 / 9),
    },
    {
      mealType: "lunch",
      foodName: "Brown rice + dal + paneer/tofu + salad",
      calories: lunchCal,
      protein: Math.round(proteinTarget * 0.3),
      carbs: Math.round(lunchCal * 0.5 / 4),
      fats: Math.round(lunchCal * 0.25 / 9),
    },
    {
      mealType: "dinner",
      foodName: "Roti/quinoa + soya/paneer + vegetables",
      calories: dinnerCal,
      protein: Math.round(proteinTarget * 0.3),
      carbs: Math.round(dinnerCal * 0.45 / 4),
      fats: Math.round(dinnerCal * 0.3 / 9),
    },
    {
      mealType: "snack",
      foodName: "Pre-workout banana + coffee",
      calories: preCal,
      protein: Math.round(proteinTarget * 0.05),
      carbs: Math.round(preCal * 0.7 / 4),
      fats: Math.round(preCal * 0.1 / 9),
    },
    {
      mealType: "snack",
      foodName: "Post-workout paneer sandwich + fruit",
      calories: postCal,
      protein: Math.round(proteinTarget * 0.13),
      carbs: Math.round(postCal * 0.45 / 4),
      fats: Math.round(postCal * 0.25 / 9),
    },
  ];
};

const formatDietPreview = (entries, calories, protein) =>
  [
    "Vegetarian Diet Preview",
    `Target Calories: ${calories} kcal`,
    `Target Protein: ${protein}g`,
    "",
    ...entries.map(
      (entry) =>
        `- ${entry.mealType}: ${entry.foodName} (${entry.calories} kcal, P${entry.protein} C${entry.carbs} F${entry.fats})`
    ),
  ].join("\n");

const isWorkoutChoice = (value) => {
  const text = String(value || "").toLowerCase();
  return text === "1" || text.includes("workout");
};

const isDietChoice = (value) => {
  const text = String(value || "").toLowerCase();
  return text === "2" || text.includes("diet");
};

const normalizeGender = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (GENDERS.includes(text)) return text;
  if (text.startsWith("m")) return "male";
  if (text.startsWith("f")) return "female";
  return "";
};

const savePlanAndWorkouts = async (plan) => {
  const planPayload = {
    monday: "",
    tuesday: "",
    wednesday: "",
    thursday: "",
    friday: "",
    saturday: "",
    sunday: "",
  };

  plan.forEach((row) => {
    planPayload[row.day.toLowerCase()] = row.split;
  });

  await api.post("/plan", planPayload);

  const workoutPayloads = plan.flatMap((row) =>
    row.exercises.map((exercise) => ({
      category: splitToCategory(row.split),
      exerciseName: exercise.name,
      sets: Number(exercise.sets),
      reps: Number(exercise.reps),
      weight: 0,
    }))
  );

  await Promise.all(workoutPayloads.map((payload) => api.post("/workout", payload)));
};

const saveDietEntries = async (entries) => {
  await Promise.all(entries.map((entry) => api.post("/diet", entry)));
};

function AiAssistantWidget({ onDataChanged = async () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [step, setStep] = useState("goal");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    goal: "",
    weight: 0,
    height: 0,
    age: 0,
    gender: "",
    trainingDays: 0,
  });
  const [pendingPlan, setPendingPlan] = useState([]);
  const [pendingDietEntries, setPendingDietEntries] = useState([]);
  const [targets, setTargets] = useState({ calories: 0, protein: 0 });
  const [messages, setMessages] = useState([
    { role: "ai", content: "What is your fitness goal? (`muscle gain` / `fat loss`)" },
  ]);

  const pushAiMessage = (content) => {
    setMessages((prev) => [...prev, { role: "ai", content }]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const answer = input.trim();
    const normalized = answer.toLowerCase();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: answer }]);

    if (normalized === "restart") {
      setProfile({ goal: "", weight: 0, height: 0, age: 0, gender: "", trainingDays: 0 });
      setPendingPlan([]);
      setPendingDietEntries([]);
      setTargets({ calories: 0, protein: 0 });
      setStep("goal");
      pushAiMessage("What is your fitness goal? (`muscle gain` / `fat loss`)");
      return;
    }

    if (step === "confirmDiet") {
      if (isYesResponse(normalized)) {
        setLoading(true);
        try {
          await saveDietEntries(pendingDietEntries);
          await onDataChanged();
        } catch (error) {
          pushAiMessage(`Unable to save diet entries: ${error?.response?.data?.message || error?.message || "Unknown error"}`);
        } finally {
          setLoading(false);
        }
        pushAiMessage("Done");
        setPendingDietEntries([]);
        setStep("completed");
        return;
      }

      if (NO_WORDS.has(normalized)) {
        pushAiMessage("Okay. Diet not added. Type `restart` when ready.");
        setPendingDietEntries([]);
        setStep("completed");
        return;
      }

      pushAiMessage('Please reply with "yes" or "no".');
      return;
    }

    if (step === "goal") {
      const goal = normalizeGoal(answer);
      if (!goal) {
        pushAiMessage("Please enter: `muscle gain` or `fat loss`.");
        return;
      }
      setProfile((prev) => ({ ...prev, goal }));
      setStep("weight");
      pushAiMessage("What is your current weight in kg?");
      return;
    }

    if (step === "weight") {
      const weight = Number(answer);
      if (!Number.isFinite(weight) || weight <= 0) {
        pushAiMessage("Please enter a valid weight in kg (example: 70).");
        return;
      }
      setProfile((prev) => ({ ...prev, weight }));
      setStep("height");
      pushAiMessage("What is your height in cm?");
      return;
    }

    if (step === "height") {
      const height = Number(answer);
      if (!Number.isFinite(height) || height <= 0) {
        pushAiMessage("Please enter a valid height in cm (example: 170).");
        return;
      }
      setProfile((prev) => ({ ...prev, height }));
      setStep("age");
      pushAiMessage("What is your age?");
      return;
    }

    if (step === "age") {
      const age = Number(answer);
      if (!Number.isInteger(age) || age < 10 || age > 100) {
        pushAiMessage("Please enter a valid age (10-100).");
        return;
      }
      setProfile((prev) => ({ ...prev, age }));
      setStep("gender");
      pushAiMessage("What is your gender? (`male` / `female`)");
      return;
    }

    if (step === "gender") {
      const gender = normalizeGender(answer);
      if (!gender) {
        pushAiMessage("Please enter: `male` or `female`.");
        return;
      }
      setProfile((prev) => ({ ...prev, gender }));
      setStep("days");
      pushAiMessage("How many days per week do you train? (1-7)");
      return;
    }

    if (step === "days") {
      const trainingDays = Number(answer);
      if (!Number.isInteger(trainingDays) || trainingDays < 1 || trainingDays > 7) {
        pushAiMessage("Please enter a number from 1 to 7.");
        return;
      }

      const finalProfile = { ...profile, trainingDays };
      const maintenance = finalProfile.weight * 30;
      const calories =
        finalProfile.goal === "muscle gain"
          ? Math.round(maintenance + 300)
          : Math.round(maintenance - 300);
      const protein = Math.round(finalProfile.weight * 1.8);

      setProfile(finalProfile);
      setTargets({ calories, protein });
      setStep("choosePlanType");

      pushAiMessage(
        [
          `Daily Calories: ${calories} kcal`,
          `Protein Target: ${protein}g`,
          "",
          "What do you want next?",
          "1) Workout",
          "2) Diet",
        ].join("\n")
      );
      return;
    }

    if (step === "choosePlanType") {
      if (isWorkoutChoice(normalized)) {
        const plan = buildWorkoutPlan(profile.trainingDays);
        setPendingPlan(plan);
        setStep("confirmAdd");
        pushAiMessage(
          [
            "Weekly Workout Plan",
            formatWorkoutPlanText(plan),
            "",
            "Do you want me to add this workout to your planner?",
          ].join("\n")
        );
        return;
      }

      if (isDietChoice(normalized)) {
        const calories = targets.calories || 2200;
        const protein = targets.protein || 120;
        const entries = buildDietEntries(calories, protein);
        setPendingDietEntries(entries);
        setStep("confirmDiet");
        pushAiMessage(
          `${formatDietPreview(entries, calories, protein)}\n\nDo you want me to add this diet to your tracker?`
        );
        return;
      }

      pushAiMessage("Please choose `1` for Workout or `2` for Diet.");
      return;
    }

    if (step === "confirmAdd") {
      if (!isYesResponse(normalized)) {
        setStep("completed");
        pushAiMessage("Okay. Type `restart` when you want a new plan.");
        return;
      }

      setLoading(true);
      try {
        await savePlanAndWorkouts(pendingPlan);
        await onDataChanged();
      } catch (error) {
        pushAiMessage(
          `Unable to save workouts: ${error?.response?.data?.message || error?.message || "Unknown error"}`
        );
      } finally {
        setLoading(false);
      }

      pushAiMessage("Done");
      setStep("completed");
      return;
    }

    if (step === "completed") {
      pushAiMessage("Type `restart` to create a fresh plan.");
    }
  };

  return (
    <div className="ai-widget-wrap">
      {isOpen ? (
        <section className="ai-widget-card">
          <header>
            <h4>AI Fitness Assistant</h4>
            <button type="button" onClick={() => setIsOpen(false)}>
              x
            </button>
          </header>
          <div className="ai-widget-messages">
            {messages.map((message, index) => (
              <p key={`${message.role}-${index}`} className={`msg-${message.role}`}>
                {message.content}
              </p>
            ))}
          </div>
          <div className="ai-widget-input">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your answer..."
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSend();
              }}
            />
            <button type="button" onClick={handleSend} disabled={loading}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </section>
      ) : null}
      <button type="button" className="ai-floating-btn" onClick={() => setIsOpen((prev) => !prev)}>
        AI
      </button>
    </div>
  );
}

export default AiAssistantWidget;
