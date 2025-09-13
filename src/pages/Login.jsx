import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser, getProfile } from "../services/api"; // 🔥 add API call

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const newErrors = [];
    if (!email && !password) {
      setErrors([]);
      return;
    }
    if (!email) newErrors.push("Email is required.");
    if (!password) newErrors.push("Password is required.");
    setErrors(newErrors);
    if (newErrors.length > 0) return;

    try {
      const loginRes = await loginUser(email, password);
      if (loginRes.must_change_password) {
        navigate("/force-change-password");
      } else {
        navigate("/");
      }
    } catch (err) {
      setErrors(["Invalid email or password"]);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-sky-600">
          Account Login
        </h2>
        {submitted &&
          (!email && !password ? (
            <div className="mb-4 text-sm text-center text-red-600">
              Email and Password is required.
            </div>
          ) : errors.length > 0 ? (
            <div className="mb-4 text-sm text-center text-red-600">
              {errors.map((err, idx) => (
                <div key={idx}>{err}</div>
              ))}
            </div>
          ) : null)}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                submitted && !email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-sky-500"
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 ${
                  submitted && !password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-sky-500"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 flex items-center h-full text-gray-500 bg-transparent right-3 hover:text-sky-600"
              >
                {showPassword ? (
                  <EyeOff className="w-6 h-6" />
                ) : (
                  <Eye className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          <Link to="/forgot-password" className="block text-sm text-right">
            Forgot Password?
          </Link>

          <button
            type="submit"
            className="w-full py-3 text-white rounded-lg bg-sky-600 hover:bg-sky-700"
          >
            Log In
          </button>
        </form>
      </div>
    </Layout>
  );
}
