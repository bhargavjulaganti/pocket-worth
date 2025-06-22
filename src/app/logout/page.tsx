"use client";
import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut(auth).finally(() => {
      router.replace("/login");
    });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <span>Logging out...</span>
    </div>
  );
}
