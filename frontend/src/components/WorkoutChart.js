import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

import "../styles/workoutchart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WorkoutChart({ workouts }) {
  const weeklyLoad = new Array(7).fill(0);
  const categoryMap = {};

  workouts.forEach((workout) => {
    const date = new Date(workout.date || workout.createdAt);
    const dayIndex = Number.isNaN(date.getTime()) ? 0 : date.getDay();
    const load = Number(workout.weight || 0) * Number(workout.sets || 0) * Number(workout.reps || 0);

    weeklyLoad[dayIndex] += load;
    categoryMap[workout.category] = (categoryMap[workout.category] || 0) + 1;
  });

  const progressData = {
    labels: DAYS,
    datasets: [
      {
        label: "Workout Volume",
        data: weeklyLoad,
        borderColor: "#1d4ed8",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(categoryMap),
    datasets: [
      {
        data: Object.values(categoryMap),
        backgroundColor: ["#2563eb", "#ea580c", "#16a34a", "#9333ea", "#f59e0b", "#0ea5e9", "#e11d48", "#4d7c0f"],
      },
    ],
  };

  return (
    <section className="chart-grid">
      <div className="chart-card">
        <h3>Weekly Workout Progress</h3>
        <Line data={progressData} />
      </div>

      <div className="chart-card">
        <h3>Workout Category Analytics</h3>
        {Object.keys(categoryMap).length ? <Doughnut data={categoryData} /> : <p>No workout data yet.</p>}
      </div>
    </section>
  );
}

export default WorkoutChart;
