import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AppLayout from "../layouts/AppLayout";

export function PrivateRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <AppLayout></AppLayout>;

    if (!user) return <Navigate to="/login" />;

    return children;
}
