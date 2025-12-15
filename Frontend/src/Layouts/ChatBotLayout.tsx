import { auth } from "@/utils/FirebaseInit";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ChatBotLayout = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<null | object>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    });

    return () => unsub()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#282A2E] flex h-dvh w-dvw items-center justify-center text-white">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-[#282A2E] flex h-dvh w-dvw">
      <Outlet />
    </div>
  );
};

export default ChatBotLayout;
