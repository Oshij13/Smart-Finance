import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getUserData } from "../store/userStore";

export default function FirstAction() {
    const navigate = useNavigate();
    const user = getUserData();

    const [plan, setPlan] = useState(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch("https://smart-finance-backend-w4ou.onrender.com/api/generate-plan", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                });

                const data = await res.json();
                setPlan(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchPlan();
    }, []);

    const target = plan?.emergencyTarget || 0;
    const weeklySave = plan?.weeklySaving || 0;
    const firstStep = plan?.firstStep || 0;

    const handleStart = () => {
        localStorage.setItem(
            "sf_progress",
            JSON.stringify({
                saved: firstStep,
                target: target,
            })
        );

        navigate("/");
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white px-6">

            <div className="bg-white text-black p-8 rounded-2xl w-full max-w-md shadow-xl text-center">

                <h1 className="text-xl font-bold mb-4">
                    Your first step 🚀
                </h1>

                <p className="text-gray-600 mb-6">
                    Build your emergency fund to stay financially safe
                </p>

                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <p className="text-sm text-gray-500">Target</p>
                    <p className="text-lg font-semibold">₹{target}</p>

                    <p className="text-sm text-gray-500 mt-3">Plan</p>
                    <p className="font-medium">₹{weeklySave}/week</p>
                </div>

                <button
                    onClick={handleStart}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
                >
                    Start with ₹{firstStep} today
                </button>

            </div>
        </div>
    );
}