import { useState } from "react";
import { setUserData } from "../store/userStore";
import { useNavigate } from "react-router";

export default function Onboarding() {
    const navigate = useNavigate();

    const questions = [
        { key: "name", question: "What's your name?" },
        { key: "occupation", question: "What do you do?" },
        { key: "city", question: "Which city are you currently residing in?" },
        { key: "income", question: "What's your monthly income?" },
        { key: "savings", question: "How much do you save monthly?" },
        { key: "investments", question: "How much have you invested?" }
    ];

    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");

    const [formData, setFormData] = useState<any>({
        name: "",
        occupation: "",
        city: "",
        income: "",
        savings: "",
        investments: ""
    });

    const handleNext = () => {
        const key = questions[step].key;

        const updatedData = {
            ...formData,
            [key]: input
        };

        setFormData(updatedData);
        setInput("");

        if (step < questions.length - 1) {
            setStep(step + 1);
        } else {
            setUserData(updatedData);
            navigate("/"); // go to dashboard
        }
    };

    // 📂 CSV Upload (Savings)
    const handleFileUpload = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event: any) => {
            const text = event.target.result;
            const rows = text.split("\n");

            let credit = 0;
            let debit = 0;

            rows.forEach((row: string) => {
                const cols = row.split(",");
                credit += parseFloat(cols[2]) || 0;
                debit += parseFloat(cols[3]) || 0;
            });

            const savings = credit - debit;

            setFormData((prev: any) => ({
                ...prev,
                savings: savings.toFixed(0)
            }));
        };

        reader.readAsText(file);
    };

    return (
        <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 text-white px-6">

            <div className="bg-white text-black p-6 rounded-2xl w-full max-w-md shadow-lg">

                <h2 className="text-lg font-semibold mb-4">
                    {questions[step].question}
                </h2>

                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-3"
                    placeholder="Type here..."
                />

                {/* CSV Upload only for savings */}
                {questions[step].key === "savings" && (
                    <div className="mb-3">
                        <p className="text-sm text-gray-500">
                            Upload bank CSV (optional)
                        </p>
                        <input type="file" accept=".csv" onChange={handleFileUpload} />
                    </div>
                )}

                {/* Investment Apps UI */}
                {questions[step].key === "investments" && (
                    <div className="flex gap-2 mb-3">
                        <button className="px-3 py-1 bg-blue-100 rounded">Zerodha</button>
                        <button className="px-3 py-1 bg-purple-100 rounded">INDmoney</button>
                        <button className="px-3 py-1 bg-green-100 rounded">Groww</button>
                    </div>
                )}

                <button
                    onClick={handleNext}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                >
                    Next
                </button>

                {/* Progress */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                    Step {step + 1} of {questions.length}
                </div>

            </div>
        </div>
    );
}