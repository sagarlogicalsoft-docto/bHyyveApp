import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebarr from "./Sidebar";
import Header from "./Header";
import Footer from "./footer/Footer";

import "./dashboard.css";
import "./sidebar.css";
import "./footer/footer.css";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className={`dashboard-app ${
        sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"
      }`}
    >
      {/* Sidebar */}
      <Sidebarr
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main area */}
      <div className="dashboard-main">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="dashboard-content">
          <Outlet />
        </main>

        <Footer />

      </div>
    </div>
  );
};

export default DashboardLayout;