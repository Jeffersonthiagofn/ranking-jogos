import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#0B0B10] text-white flex flex-col">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">{children}</main>

            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}
