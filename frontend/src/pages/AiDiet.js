import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "../styles/diet.css";

function AiDiet(){

const [goal,setGoal]=useState("");
const [weight,setWeight]=useState("");
const [result,setResult]=useState("");

const getDiet = async ()=>{

const res = await api.post("/ai/diet",{
goal,
weight
});

setResult(res.data.suggestion);

};

return(

<main className="app-shell diet-page"><Sidebar/><section className="app-main"><Navbar/><section className="diet-container"><article className="ai-diet-card"><h2>AI Diet Planner</h2><input
placeholder="Your Goal (muscle gain / fat loss)"
value={goal}
onChange={(e)=>setGoal(e.target.value)}
/>

<input
placeholder="Your Weight"
value={weight}
onChange={(e)=>setWeight(e.target.value)}
/>

<button onClick={getDiet}>
Generate AI Diet
</button><pre className="ai-output">{result}</pre></article></section></section></main>);

}

export default AiDiet;
