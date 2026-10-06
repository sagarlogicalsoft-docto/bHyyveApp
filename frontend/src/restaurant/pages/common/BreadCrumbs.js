import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";
import "./breadCrumbs.css";

const Breadcrumbs = ({ items = [] }) => {
  return (
    <div className="breadcrumbs">
      <Link to="/restaurant/dashboard" className="breadcrumb-home">
        <FaHome />
        <span>Home</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <FaChevronRight className="breadcrumb-separator" />

            {isLast || !item.path ? (
              <span className="breadcrumb-current">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="breadcrumb-link">
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Breadcrumbs;