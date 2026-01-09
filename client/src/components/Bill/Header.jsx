import { Link, useLocation } from "react-router-dom";
import { Plus, LayoutDashboard } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const isCreatePage = location.pathname === "/bills/create";

  return (
    <div className="relative bg-white text-black">
      {/* Background image container */}
      <div className="w-full h-43 bg-[url('/bill/headerbg.jpg')] bg-cover bg-center">
        {/* Content container matching layout width */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link to="/">
              <img
                src="bill/stlogo.png"
                alt="Statsaya Logo"
                className="h-24 w-auto object-contain" // Adjusted size for better proportion
              />
            </Link>
          </div>

          {/* Action Button */}
          <div>
            {isCreatePage ? (
              <Link
                to="/bills/view"
                className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 mb-20 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/bills/create"
                className="flex items-center gap-2 bg-[#ea1e79] text-white px-4 py-2 rounded-md mb-20 hover:bg-pink-700 transition-colors text-sm"
              >
                <Plus size={16} />
                <span>Create New Bill</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
