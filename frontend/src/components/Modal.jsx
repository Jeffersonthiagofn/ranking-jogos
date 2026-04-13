import { useEffect } from "react";

export default function Modal({ isOpen, onClose, children }) {
    useEffect(() => {
        function handleEsc(e) {
            if (e.key === "Escape") onClose();
        }

        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* overlay */}
            <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* modal */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-[#1b2838] p-6 shadow-xl ring-1 ring-white/10">
                {children}
            </div>
        </div>
    );
}
