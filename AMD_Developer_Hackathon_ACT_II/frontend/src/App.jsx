import React from "react";
import LandingPage from "./landing/LandingPage.jsx";
import { Route, Routes } from "react-router-dom";
import Agent from "./agent/Agent.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}></Route>
      <Route path="/agent" element={<Agent />}></Route>
    </Routes>
  );
}

export default App;
