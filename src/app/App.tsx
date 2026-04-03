import { useState } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import AIChat from "./components/AIChat";
import { setUserData as setGlobalUserData } from "./store/userStore"; // ✅ rename

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <>
      {!showDashboard ? (
        <AIChat
          onComplete={(data: any) => {
            console.log("Onboarding Data", data);

            setGlobalUserData(data); // ✅ THIS IS THE FIX

            setShowDashboard(true);
          }}
        />
      ) : (
        <>
          <RouterProvider router={router} />
          <Toaster />
        </>
      )}
    </>
  );
}