// Layout.jsx
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <Outlet />
    </div>
  );
}
