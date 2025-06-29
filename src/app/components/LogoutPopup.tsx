import React from "react";

interface LogoutPopupProps {
  open: boolean;
  onStay: () => void;
  onLogout: () => void;
  secondsLeft: number;
}

const LogoutPopup: React.FC<LogoutPopupProps> = ({ open, onStay, onLogout, secondsLeft }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Session Expiring</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300 text-center">
          You will be logged out in <span className="font-semibold">{secondsLeft}</span> seconds due to inactivity.
        </p>
        <div className="flex gap-4 mt-2">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            onClick={onStay}
          >
            Stay Logged In
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 text-white font-semibold hover:bg-red-600 transition"
            onClick={onLogout}
          >
            Logout Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopup;
