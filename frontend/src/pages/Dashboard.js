import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import Navbar from "../components/Navbar.js";
import Sidebar from "../components/Sidebar.js";
import WorkoutChart from "../components/WorkoutChart.js";
import "../styles/dashboard.css";
import AiAssistantWidget from "../components/AiAssistantWidget.js";
import "../styles/planner.css";

const DEFAULT_PLAN = {
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
  sunday: "",
};

const CATEGORIES = ["Chest", "Back", "Shoulder", "Abs", "Arms", "Biceps", "Triceps", "Legs"];
const WEEK_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const PLAN_OPTIONS = ["Chest + Triceps", "Back + Biceps", "Legs", "Shoulders", "Abs", "Rest Day"];

const formatAiWorkoutResponse = (data) => {
  const rows = Array.isArray(data?.weeklyWorkout) ? data.weeklyWorkout : [];
  if (!rows.length) {
    return data?.reply || "No workout suggestion available.";
  }

  return rows
    .map((row) => {
      const exercises = Array.isArray(row?.exercises) ? row.exercises : [];
      const exerciseLines = exercises
        .map((exercise) => `- ${exercise?.name || "Exercise"}: ${exercise?.sets || 3} x ${exercise?.reps || 10}`)
        .join("\n");
      return `${row?.day || "Day"} - ${row?.split || "Workout"}\n${exerciseLines}`;
    })
    .join("\n\n");
};

const formatAiDietResponse = (data) => {
  const meals = Array.isArray(data?.dietPlan) ? data.dietPlan : [];
  const nutrition = data?.nutrition?.estimated;

  if (!meals.length) {
    return data?.reply || "No diet suggestion available.";
  }

  const mealLines = meals.map((meal) => `- ${meal?.meal || "Meal"}: ${meal?.item || "Food item"}`);
  const nutritionLines = nutrition
    ? [
        "",
        `Calories: ${nutrition?.calorieTarget || "N/A"} kcal`,
        `Protein: ${nutrition?.proteinTarget_g || "N/A"} g`,
        `Carbs: ${nutrition?.carbsTarget_g || "N/A"} g`,
        `Fats: ${nutrition?.fatsTarget_g || "N/A"} g`,
      ]
    : [];

  return [...mealLines, ...nutritionLines].join("\n");
};

const getCurrentDayKey = () => {
  const day = new Date().getDay();
  return WEEK_DAYS[day === 0 ? 6 : day - 1];
};

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState("");
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [status, setStatus] = useState("");
  const [selectedDay, setSelectedDay] = useState(getCurrentDayKey());
  const [aiWorkoutSuggestion, setAiWorkoutSuggestion] = useState("");
  const [aiDietSuggestion, setAiDietSuggestion] = useState("");
  const [aiWorkoutLoading, setAiWorkoutLoading] = useState(false);
  const [aiDietLoading, setAiDietLoading] = useState(false);
  const [dietGoal, setDietGoal] = useState("Muscle gain");
  const [dietWeight, setDietWeight] = useState("");

  const [form, setForm] = useState({
    category: "Chest",
    exerciseName: "",
    sets: "",
    reps: "",
    weight: "",
  });

  const fetchWorkouts = async () => {
    const response = await api.get("/workout");
    setWorkouts(response.data);
  };

  const fetchPlan = async () => {
    const response = await api.get("/plan");
    setPlan((previous) => ({ ...previous, ...response.data }));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchWorkouts(), fetchPlan()]);
      } catch (_error) {
        setStatus("Failed to load dashboard data");
      }
    };

    loadData();
  }, []);

  const filteredWorkouts = useMemo(() => {
    if (filter === "All") {
      return workouts;
    }

    return workouts.filter((item) => item.category === filter);
  }, [workouts, filter]);

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, item) => sum + item.sets * item.reps * item.weight, 0);
    const uniqueExercises = new Set(workouts.map((item) => item.exerciseName)).size;
    const weeklyVolume = workouts.reduce((sum, item) => {
      const workoutDate = new Date(item.date || item.createdAt);
      const ageMs = Date.now() - workoutDate.getTime();
      const isInLastWeek = ageMs >= 0 && ageMs <= 7 * 24 * 60 * 60 * 1000;
      return isInLastWeek ? sum + item.sets * item.reps * item.weight : sum;
    }, 0);

    return {
      totalWorkouts,
      totalVolume,
      uniqueExercises,
      weeklyVolume,
    };
  }, [workouts]);

  const resetForm = () => {
    setForm({
      category: "Chest",
      exerciseName: "",
      sets: "",
      reps: "",
      weight: "",
    });
    setEditingId("");
  };

  const handleWorkoutSubmit = async (event) => {
    event.preventDefault();
    setStatus("");

    const payload = {
      category: form.category,
      exerciseName: form.exerciseName,
      sets: Number(form.sets),
      reps: Number(form.reps),
      weight: Number(form.weight || 0),
    };

    try {
      if (editingId) {
        await api.put(`/workout/${editingId}`, payload);
      } else {
        await api.post("/workout", payload);
      }

      await fetchWorkouts();
      resetForm();
      setStatus("Workout saved");
    } catch (_error) {
      setStatus("Unable to save workout");
    }
  };

  const handleDelete = async (id) => {
    setStatus("");

    try {
      await api.delete(`/workout/${id}`);
      await fetchWorkouts();
      setStatus("Workout deleted");
    } catch (_error) {
      setStatus("Unable to delete workout");
    }
  };

  const startEdit = (workout) => {
    setEditingId(workout._id);
    setForm({
      category: workout.category,
      exerciseName: workout.exerciseName,
      sets: String(workout.sets),
      reps: String(workout.reps),
      weight: String(workout.weight),
    });
  };

  const handlePlanSave = async () => {
    setStatus("");

    try {
      await api.post("/plan", plan);
      setStatus("Weekly workout plan saved");
    } catch (_error) {
      setStatus("Unable to save workout plan");
    }
  };

  const requestAiWorkout = async (day) => {
    setAiWorkoutLoading(true);
    try {
      const response = await api.post("/ai/workout", {
        day,
        split: plan[day] || "",
      });
      setAiWorkoutSuggestion(formatAiWorkoutResponse(response.data));
    } catch (_error) {
      setAiWorkoutSuggestion("Unable to generate AI workout right now.");
    } finally {
      setAiWorkoutLoading(false);
    }
  };

  const requestAiDiet = async () => {
    setAiDietLoading(true);
    try {
      const response = await api.post("/ai/diet", {
        goal: dietGoal,
        weight: Number(dietWeight || 0),
      });
      setAiDietSuggestion(formatAiDietResponse(response.data));
    } catch (_error) {
      setAiDietSuggestion("Unable to generate AI diet right now.");
    } finally {
      setAiDietLoading(false);
    }
  };

  useEffect(() => {
    requestAiWorkout(selectedDay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, plan[selectedDay]]);

  const refreshAfterAiAdd = async () => {
    try {
      await Promise.all([fetchWorkouts(), fetchPlan()]);
      setStatus("AI plan synced to dashboard");
    } catch (_error) {
      setStatus("AI saved data but dashboard refresh failed");
    }
  };

  return (
    <main className="app-shell dashboard-page">
      <Sidebar />
      <section className="app-main">
        <Navbar />
        <section className="dashboard-container">
        <header className="dashboard-header">
          <div>
            <p className="header-overline">Your Fitness Command Center</p>
            <h2>Training Dashboard</h2>
          </div>
        </header>

        <section className="stats-container">
          <article className="stat-card">
            <h4>Total Workouts</h4>
            <p>{stats.totalWorkouts}</p>
          </article>
          <article className="stat-card">
            <h4>Total Weight Lifted</h4>
            <p>{stats.totalVolume} kg</p>
          </article>
          <article className="stat-card">
            <h4>Total Exercises</h4>
            <p>{stats.uniqueExercises}</p>
          </article>
          <article className="stat-card">
            <h4>Weekly Progress</h4>
            <p>{stats.weeklyVolume} kg</p>
          </article>
        </section>

        <WorkoutChart workouts={workouts} />

        <section className="ai-reco-grid">
          <article className="ai-card">
            <div className="ai-card-head">
              <h3>AI Recommended Workout</h3>
              <select value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>
                {WEEK_DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <p className="ai-subtext">Selected split: {plan[selectedDay] || "Auto suggestion based on day"}</p>
            <pre className="ai-output">{aiWorkoutLoading ? "Generating..." : aiWorkoutSuggestion}</pre>
          </article>

          <article className="ai-card">
            <h3>AI Recommended Diet</h3>
            <div className="ai-diet-form">
              <input value={dietGoal} onChange={(event) => setDietGoal(event.target.value)} placeholder="Goal (muscle gain, fat loss)" />
              <input value={dietWeight} onChange={(event) => setDietWeight(event.target.value)} placeholder="Weight (kg)" type="number" min="0" />
              <button className="add-btn" type="button" onClick={requestAiDiet}>
                {aiDietLoading ? "Generating..." : "Generate Diet"}
              </button>
            </div>
            <pre className="ai-output">{aiDietSuggestion}</pre>
          </article>
        </section>

        <section id="weekly-planner" className="planner-card">
          <h3>Weekly Workout Planner</h3>
          <div className="planner-grid">
            {WEEK_DAYS.map((day) => (
              <label key={day} className="planner-item">
                <span>{day}</span>
                <select
                  value={plan[day] || ""}
                  onChange={(event) => setPlan((prev) => ({ ...prev, [day]: event.target.value }))}
                >
                  <option value="">Select workout split</option>
                  {PLAN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <button className="add-btn" type="button" onClick={handlePlanSave}>
            Save Weekly Plan
          </button>
        </section>

        <section className="category-filter">
          <button type="button" className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>
            All
          </button>
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </section>

        <section className="dashboard-layout">
          <article className="form-section">
            <h3>{editingId ? "Edit Workout" : "Add Workout"}</h3>
            <form className="workout-form" onSubmit={handleWorkoutSubmit}>
              <select value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Exercise name"
                value={form.exerciseName}
                onChange={(event) => setForm((prev) => ({ ...prev, exerciseName: event.target.value }))}
                required
              />
              <input type="number" min="1" placeholder="Sets" value={form.sets} onChange={(event) => setForm((prev) => ({ ...prev, sets: event.target.value }))} required />
              <input type="number" min="1" placeholder="Reps" value={form.reps} onChange={(event) => setForm((prev) => ({ ...prev, reps: event.target.value }))} required />
              <input type="number" min="0" placeholder="Weight (kg)" value={form.weight} onChange={(event) => setForm((prev) => ({ ...prev, weight: event.target.value }))} />
              <button className="add-btn" type="submit">
                {editingId ? "Update Workout" : "Add Workout"}
              </button>
            </form>
          </article>

          <article className="workout-section">
            <h3>Workout List</h3>
            <div className="workout-list">
              {filteredWorkouts.map((workout) => (
                <div className="workout-card" key={workout._id}>
                  <p><strong>{workout.category}</strong> - {workout.exerciseName}</p>
                  <p>{workout.sets} sets x {workout.reps} reps at {workout.weight} kg</p>
                  <div className="btn-group">
                    <button className="edit-btn" type="button" onClick={() => startEdit(workout)}>
                      Edit
                    </button>
                    <button className="delete-btn" type="button" onClick={() => handleDelete(workout._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination-bar">
              <button type="button">Prev</button>
              <span>Page 1</span>
              <button type="button">Next</button>
            </div>
          </article>
        </section>

        {status ? <p className="status-text">{status}</p> : null}
        <AiAssistantWidget onDataChanged={refreshAfterAiAdd} />
        </section>
      </section>
    </main>
  );
}

export default Dashboard;
