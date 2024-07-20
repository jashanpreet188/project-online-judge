import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './Pages/register.jsx';
import Login from './Pages/login.jsx';
import Navbar from './Pages/Navbar.jsx';
import ProblemSet from './Pages/ProblemSet.jsx';
import ProblemDetails from './Pages/ProblemDetails.jsx';
import Profile from './Pages/Profile.jsx';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/problems" element={<ProblemSet />} />
        <Route path="/problems/:id" element={<ProblemDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;