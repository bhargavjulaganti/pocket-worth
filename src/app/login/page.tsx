"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { auth } from "../../utils/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
// If you have a Google login util, import it here:
import { signInWithGoogle } from "../../utils/googleAuth";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  symbol: string;
  rotation: number;
  rotationSpeed: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const AnimatedLoginPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationIdRef = useRef<number | null>(null);
  const router = useRouter();

  // Initialize particles
  const initParticles = useCallback(() => {
    const colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];
    const moneySymbols = ["$", "€", "£", "¥", "₹", "₿", "💰", "💸", "💵", "💴", "💶", "💷", "🪙", "💎"];
    const newParticles: Particle[] = [];
    for (let i = 0; i < 35; i++) {
      newParticles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 15 + 20,
        opacity: Math.random() * 0.4 + 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        symbol: moneySymbols[Math.floor(Math.random() * moneySymbols.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
      });
    }
    setParticles(newParticles);
  }, [dimensions.width, dimensions.height]);

  // Set canvas dimensions
  React.useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize particles when dimensions are set
  React.useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      initParticles();
    }
  }, [dimensions, initParticles]);

  // Handle mouse movement
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Animation loop
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || particles.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const updatedParticles = particles.map((particle) => {
        const dx = mousePos.x - particle.x;
        const dy = mousePos.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.vx += dx * force * 0.0002;
          particle.vy += dy * force * 0.0002;
          particle.rotationSpeed += force * 0.5;
        }
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        particle.vx *= 0.998;
        particle.vy *= 0.998;
        particle.rotationSpeed *= 0.99;
        return particle;
      });
      ctx.globalAlpha = 0.15;
      updatedParticles.forEach((particle, i) => {
        updatedParticles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });
      updatedParticles.forEach((particle) => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate((particle.rotation * Math.PI) / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        ctx.font = `${particle.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.fillText(particle.symbol, 0, 0);
        ctx.restore();
      });
      setParticles(updatedParticles);
      ctx.globalAlpha = 1;
      animationIdRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [particles, mousePos, dimensions]);

  // Login handler with Firebase
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        setError("Login failed: " + (err as { message: string }).message);
      } else {
        setError("Login failed: Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google login handler (replace with your actual Google login logic if available)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // If you have a Google login util, use it here:
      // await signInWithGoogle();
      // router.push("/");
      setTimeout(() => {
        setIsLoading(false);
        setError("Google login not implemented");
      }, 1000);
    } catch (err: unknown) {
      setError("Google login failed");
      setIsLoading(false);
    }
  };

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          width: "100%",
          height: "100%",
        }}
      />
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20" />
      {/* Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleLogin}
            className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-gray-700/50"
          >
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              Login
            </h2>
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-700/70"
                  placeholder="Email"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 hover:from-blue-500/10 hover:via-purple-500/10 hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-gray-700/70"
                  placeholder="Password"
                  required
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 hover:from-blue-500/10 hover:via-purple-500/10 hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
                )}
                <span className="relative flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </span>
              </button>
            </div>
            {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLoginPage;
