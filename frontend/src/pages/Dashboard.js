import { useEffect, useMemo, useState } from "react";

import api from "../api/axios.js";
import Navbar from "../components/Navbar.js";
import WorkoutChart from "../components/WorkoutChart.js";
import "../styles/dashboard.css";

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

function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState("");
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [status, setStatus] = useState("");

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

    return {
      totalWorkouts,
      totalVolume,
      uniqueExercises,
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

  return (
    <main className="dashboard-container">
      <Navbar />

      <section className="stats-container">
        <article className="stat-card">
          <h4>Total Workouts</h4>
          <p>{stats.totalWorkouts}</p>
        </article>
        <article className="stat-card">
          <h4>Total Volume</h4>
          <p>{stats.totalVolume} kg</p>
        </article>
        <article className="stat-card">
          <h4>Unique Exercises</h4>
          <p>{stats.uniqueExercises}</p>
        </article>
      </section>

      <section className="category-filter">
        <button type="button" onClick={() => setFilter("All")}>All</button>
        {CATEGORIES.map((item) => (
          <button key={item} type="button" onClick={() => setFilter(item)}>
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
        </article>
      </section>

      <section className="planner-card">
        <h3>Weekly Workout Planner</h3>
        <div className="planner-grid">
          {Object.keys(plan).map((day) => (
            <label key={day} className="planner-item">
              <span>{day}</span>
              <input
                value={plan[day]}
                onChange={(event) => setPlan((prev) => ({ ...prev, [day]: event.target.value }))}
                placeholder="Example: Chest + Triceps"
              />
            </label>
          ))}
        </div>
        <button className="add-btn" type="button" onClick={handlePlanSave}>
          Save Weekly Plan
        </button>
      </section>

      {status ? <p className="status-text">{status}</p> : null}
      <WorkoutChart workouts={workouts} />
    </main>
  );
}

export default Dashboard;
