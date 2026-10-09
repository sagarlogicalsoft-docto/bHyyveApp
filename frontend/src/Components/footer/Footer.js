import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="dashboard-footer">
      <div className="dashboard-footer-inner">
        <p>
          Copyright © {new Date().getFullYear()} bHyyve. All rights reserved.
        </p>

        <p className="footer-tagline">
          Designed for modern admin operations.
        </p>
      </div>
    </footer>
  );
};

export default Footer;