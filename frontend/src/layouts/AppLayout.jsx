import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";

export default function AppLayout({ children }) {
    const location = useLocation();
    return (
        <div className="min-h-screen bg-[#0B0B10] text-white flex flex-col">
            <Navbar />
            {location.pathname == "/profile" ? (
                <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-10">{children}</main>
            ) : (
                <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">{children}</main>
            )}

            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}
