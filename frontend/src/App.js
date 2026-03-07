import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Dashboard from "./pages/Dashboard.js";
import Profile from "./pages/Profile.js";
import Diet from "./pages/Diet.js";
import CaloriesCalculator from "./pages/CaloriesCalculator.js";
import AiDiet from "./pages/AiDiet";


function App() {
return (
<BrowserRouter>
<Routes>

    <Route path="/" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
 path="/ai-diet"
 element={
   <ProtectedRoute>
     <AiDiet/>
   </ProtectedRoute>
 }
/>

    <Route
      path="/diet"
      element={
        <ProtectedRoute>
          <Diet />
        </ProtectedRoute>
      }
    />

    <Route
      path="/calories"
      element={
        <ProtectedRoute>
          <CaloriesCalculator />
        </ProtectedRoute>
      }
    />

    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />

  </Routes>
</BrowserRouter>

);
}

export default App;