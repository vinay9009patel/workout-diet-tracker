import { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/calories.css";

function CaloriesCalculator() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState(1.2);
  const [result, setResult] = useState(null);
  const [consumed, setConsumed] = useState("");
  const [protein, setProtein] = useState("");

  const calculateCalories = () => {
    let bmr;

    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const calories = bmr * activity;
    setResult(Math.round(calories));
  };

  return (
    <main className="app-shell calorie-page">
      <Sidebar />
      <section className="app-main">
        <Navbar />
        <section className="calorie-container">
          <h2>Calorie Tracker</h2>
          <div className="calorie-form">
            <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            <input placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <input placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} />

            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="1.2">Sedentary</option>
              <option value="1.375">Light</option>
              <option value="1.55">Moderate</option>
              <option value="1.725">Active</option>
              <option value="1.9">Very Active</option>
            </select>

            <input
              placeholder="Calories Consumed"
              value={consumed}
              onChange={(e) => setConsumed(e.target.value)}
            />
            <input
              placeholder="Protein Intake (g)"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />

            <button type="button" onClick={calculateCalories}>
              Calculate
            </button>
          </div>

          {result ? (
            <section className="calorie-stats">
              <article className="calorie-card">
                <h4>Calories Consumed</h4>
                <p>{Number(consumed || 0)} kcal</p>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min((Number(consumed || 0) / result) * 100, 100)}%` }}
                  />
                </div>
              </article>

              <article className="calorie-card">
                <h4>Calories Remaining</h4>
                <p>{Math.max(result - Number(consumed || 0), 0)} kcal</p>
                <div className="progress-track">
                  <div
                    className="progress-fill secondary"
                    style={{
                      width: `${Math.max(100 - Math.min((Number(consumed || 0) / result) * 100, 100), 0)}%`,
                    }}
                  />
                </div>
              </article>

              <article className="calorie-card">
                <h4>Protein Intake</h4>
                <p>{Number(protein || 0)} g</p>
                <div className="progress-track">
                  <div
                    className="progress-fill protein"
                    style={{ width: `${Math.min((Number(protein || 0) / 180) * 100, 100)}%` }}
                  />
                </div>
              </article>
            </section>
          ) : null}
        </section>
      </section>
    </main>
  );
}

export default CaloriesCalculator;
