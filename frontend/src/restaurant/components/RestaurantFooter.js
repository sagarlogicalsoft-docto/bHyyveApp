
import React from "react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

import "./restaurantFooter.css";

const RestaurantFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="restaurant-footer">
      <div className="restaurant-footer-inner">
        {/* =====================================================
            COPYRIGHT
        ===================================================== */}

        <div className="restaurant-footer-left">
          <span>
            © {currentYear} <strong>bHyyve Restaurant</strong>.
          </span>

          <span className="restaurant-footer-divider">|</span>

          <span>All rights reserved.</span>
        </div>

        {/* =====================================================
            FOOTER LINKS
        ===================================================== */}

        <div className="restaurant-footer-links">
          <button type="button">Privacy Policy</button>

          <button type="button">Terms & Conditions</button>

          <button type="button">Help & Support</button>
        </div>

        {/* =====================================================
            SOCIAL ICONS
        ===================================================== */}

        <div className="restaurant-footer-social">
          <button
            type="button"
            aria-label="Facebook"
            title="Facebook"
          >
            <FaFacebookF />
          </button>

          <button
            type="button"
            aria-label="Instagram"
            title="Instagram"
          >
            <FaInstagram />
          </button>

          <button
            type="button"
            aria-label="Twitter"
            title="Twitter"
          >
            <FaTwitter />
          </button>

          <button
            type="button"
            aria-label="LinkedIn"
            title="LinkedIn"
          >
            <FaLinkedinIn />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default RestaurantFooter;
