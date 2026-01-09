import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header className="max-w-6xl" />
        <div className="bg-white shadow-sm p-6">
          <Outlet />
        </div>
        <Footer className="max-w-6xl" />
      </main>
    </div>
  );
};

export default Layout;
