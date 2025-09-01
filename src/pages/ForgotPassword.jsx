import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-sky-600">
          Forgot Password
        </h2>
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input type="email" placeholder="Enter your registered email" />
          </div>

          {/* Action buttons side by side */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex-1 py-3 rounded-lg bg-gray-300 text-gray-700 font-medium hover:bg-gray-400 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              className="flex-1 py-3 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition"
            >
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
