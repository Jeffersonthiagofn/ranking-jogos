import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Ranking from "../pages/Ranking";
import Compare from "../pages/Compare";

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/ranking"
                    element={
                        <PrivateRoute>
                            <Ranking />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/comparacao"
                    element={
                        <PrivateRoute>
                            <Compare />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}
