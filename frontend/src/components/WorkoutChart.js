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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORY_LABELS = ["Chest", "Back", "Shoulder", "Arms", "Legs", "Abs"];

function WorkoutChart({ workouts }) {
  const weeklyLoad = new Array(7).fill(0);
  const categoryMap = {
    Chest: 0,
    Back: 0,
    Shoulder: 0,
    Arms: 0,
    Legs: 0,
    Abs: 0,
  };

  workouts.forEach((workout) => {
    const date = new Date(workout.date || workout.createdAt);
    const jsDay = Number.isNaN(date.getTime()) ? 1 : date.getDay();
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1;
    const load = Number(workout.weight || 0) * Number(workout.sets || 0) * Number(workout.reps || 0);
    const category = workout.category || "";

    weeklyLoad[dayIndex] += load;
    if (category === "Chest" || category === "Back" || category === "Shoulder" || category === "Legs" || category === "Abs") {
      categoryMap[category] += 1;
    }

    if (category === "Arms" || category === "Biceps" || category === "Triceps") {
      categoryMap.Arms += 1;
    }
  });

  const progressData = {
    labels: DAYS,
    datasets: [
      {
        label: "Workout Volume",
        data: weeklyLoad,
        borderColor: "#6366f1",
        backgroundColor: (context) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(99, 102, 241, 0.18)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(99, 102, 241, 0.35)");
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.02)");
          return gradient;
        },
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#818cf8",
        pointBorderWidth: 1,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const categoryData = {
    labels: CATEGORY_LABELS,
    datasets: [
      {
        data: CATEGORY_LABELS.map((label) => categoryMap[label]),
        borderWidth: 0,
        backgroundColor: ["#6366f1", "#2563eb", "#8b5cf6", "#ec4899", "#0ea5e9", "#14b8a6"],
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#e2e8f0",
        bodyColor: "#e2e8f0",
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(148, 163, 184, 0.12)" },
        ticks: { color: "#94a3b8" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(148, 163, 184, 0.12)" },
        ticks: { color: "#94a3b8" },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#cbd5e1", boxWidth: 12, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#e2e8f0",
        bodyColor: "#e2e8f0",
      },
    },
  };

  return (
    <section className="chart-grid">
      <div className="chart-card">
        <h3>Weekly Workout Progress</h3>
        <div className="chart-canvas-wrap">
          <Line data={progressData} options={lineOptions} />
        </div>
      </div>

      <div className="chart-card">
        <h3>Workout Category Analytics</h3>
        {workouts.length ? (
          <div className="chart-canvas-wrap">
            <Doughnut data={categoryData} options={doughnutOptions} />
          </div>
        ) : (
          <p>No workout data yet.</p>
        )}
      </div>
    </section>
  );
}

export default WorkoutChart;
