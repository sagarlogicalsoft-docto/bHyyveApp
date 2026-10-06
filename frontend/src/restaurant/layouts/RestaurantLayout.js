import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import RestaurantNavbar from "../components/RestaurantNavbar";
import RestaurantSidebar from "../components/RestaurantSidebar";
import RestaurantFooter from "../components/RestaurantFooter";

import "./restaurantLayout.css";

const RestaurantLayout = () => {
  // =========================================================
  // SIDEBAR STATE
  // =========================================================

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =========================================================
  // TOGGLE SIDEBAR
  // =========================================================

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

   useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarOpen ? "260px" : "76px"
    );
  }, [sidebarOpen]);

  return (
    <div
      className={`restaurant-layout ${
        sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
      }`}
    >
      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <RestaurantNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <RestaurantSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="restaurant-main-content">
        <div className="restaurant-content-wrapper">
          <Outlet />
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <RestaurantFooter />
      </main>
    </div>
  );
};

export default RestaurantLayout;
