import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/diet.css";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

function Diet() {
  const [diets, setDiets] = useState([]);

  const [form, setForm] = useState({
    mealType: "breakfast",
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  const fetchDiets = async () => {
    const res = await api.get("/diet");
    setDiets(res.data);
  };

  useEffect(() => {
    fetchDiets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post("/diet", {
      mealType: form.mealType,
      foodName: form.foodName,
      calories: Number(form.calories),
      protein: Number(form.protein),
      carbs: Number(form.carbs),
      fats: Number(form.fats),
    });

    setForm({
      mealType: "breakfast",
      foodName: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    });

    fetchDiets();
  };

  const deleteDiet = async (id) => {
    await api.delete(`/diet/${id}`);
    fetchDiets();
  };

  const groupedMeals = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = diets.filter((item) => item.mealType === type);
    return acc;
  }, {});

  return (
    <main className="app-shell diet-page">
      <Sidebar />
      <section className="app-main">
        <Navbar />
        <section className="diet-container">
        <h2>Diet Tracker</h2>
        <form className="diet-form" onSubmit={handleSubmit}>
          <select name="mealType" value={form.mealType} onChange={handleChange}>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snacks</option>
          </select>
          <input
            name="foodName"
            placeholder="Food Name"
            value={form.foodName}
            onChange={handleChange}
            required
          />
          <input
            name="calories"
            type="number"
            placeholder="Calories"
            value={form.calories}
            onChange={handleChange}
            required
          />
          <input
            name="protein"
            type="number"
            placeholder="Protein"
            value={form.protein}
            onChange={handleChange}
            required
          />
          <input
            name="carbs"
            type="number"
            placeholder="Carbs"
            value={form.carbs}
            onChange={handleChange}
            required
          />
          <input
            name="fats"
            type="number"
            placeholder="Fats"
            value={form.fats}
            onChange={handleChange}
            required
          />
          <button type="submit">Add Meal</button>
        </form>

        <div className="meal-grid">
          {MEAL_TYPES.map((mealType) => (
            <article key={mealType} className="meal-column">
              <h3>{mealType === "snack" ? "Snacks" : mealType}</h3>
              <div className="meal-list">
                {groupedMeals[mealType].length ? (
                  groupedMeals[mealType].map((item) => (
                    <div className="diet-card" key={item._id}>
                      <h4>{item.foodName}</h4>
                      <p>Calories: {item.calories}</p>
                      <p>Protein: {item.protein}g</p>
                      <p>Carbs: {item.carbs}g</p>
                      <button type="button" onClick={() => deleteDiet(item._id)}>Delete</button>
                    </div>
                  ))
                ) : (
                  <p className="empty-text">No meals added.</p>
                )}
              </div>
            </article>
          ))}
        </div>
        </section>
      </section>
    </main>
  );
}

export default Diet;
