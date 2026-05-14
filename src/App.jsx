import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Components/Home";
import Signup from "./Components/Signup";
import Signin from "./Components/Signin";
import Traning from "./Components/Traning";
import Profile from "./Components/Profile";
import Nav from "./Components/Nav";
import OneSession from "./Components/OneSession";
import Tracking from "./Components/Tracking";
import AdminDashboard from "./Components/AdminDashboard";
import Camera from "./Components/Camera";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              {" "}
              <Nav /> <Home />
            </>
          }
        />

        <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />
        <Route
          path="/session"
          element={
            <>
              {" "}
              <Nav />
              <OneSession />
            </>
          }
        />
        <Route
          path="/traning"
          element={
            <>
              {" "}
              <Nav />
              <Traning />
            </>
          }
        />
        <Route
          path="/tracking"
          element={
            <>
              {" "}
              <Nav />
              <Tracking />
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              {" "}
              <Nav />
              <Profile />
            </>
          }
        />

        <Route path="/camera" element={<Camera />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="*"
          element={<h1 style={{ color: "red" }}>Page Not Found</h1>}
        />
      </Routes>
    </Router>
  );
}

export default App;
