import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function ForgotPassword() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
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
              className="flex-1 py-3 font-medium text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>

            <button
              type="button"
              className="flex-1 py-3 font-medium text-white transition rounded-lg bg-sky-600 hover:bg-sky-700"
            >
              Send OTP
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
