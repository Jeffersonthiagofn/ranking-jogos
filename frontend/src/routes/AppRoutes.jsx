import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Ranking from "../pages/Ranking";
import Compare from "../pages/Compare";
import GameDetails from "../pages/GameDetails";
import Profile from "../pages/Profile";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/game/:appid" element={<GameDetails />} />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
