// "use client";
// import { useState } from "react";
// import { auth } from "../utils/firebaseConfig";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       router.push("/");
//     } catch (err: unknown) {
//       if (
//         typeof err === "object" &&
//         err !== null &&
//         "message" in err &&
//         typeof (err as Record<string, unknown>).message === "string"
//       ) {
//         setError("Login failed: " + (err as { message: string }).message);
//       } else {
//         setError("Login failed: Unknown error");
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80 p-8 border rounded shadow">
//         <h2 className="text-xl font-bold mb-2">Login</h2>
//         <input
//           type="email"
//           placeholder="Email"
//           className="border px-3 py-2 rounded"
//           value={email}
//           onChange={e => setEmail(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           className="border px-3 py-2 rounded"
//           value={password}
//           onChange={e => setPassword(e.target.value)}
//           required
//         />
//         <button type="submit" className="bg-green-600 text-white py-2 rounded hover:bg-green-700">
//           Login
//         </button>
//         {error && <div className="text-red-600">{error}</div>}
//       </form>
//     </div>
//   );
// }
