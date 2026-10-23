import React from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaHome } from "react-icons/fa";

import "./serviceBreadcrumbs.css";

const ServiceBreadcrumbs = ({
  items = [],
  homeLabel = "Home",
  homePath = "/home",
  showHome = true,
  className = "",
}) => {
  const crumbs = showHome
    ? [{ label: homeLabel, to: homePath }, ...items]
    : items;

  if (crumbs.length === 0) return null;

  return (
    <nav
      className={`app-breadcrumb ${className}`.trim()}
      aria-label="Breadcrumb"
    >
      <ol className="app-breadcrumb-list">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const isHome = showHome && index === 0;

          return (
            <li key={`${crumb.label}-${index}`} className="app-breadcrumb-item">
              {isLast || !crumb.to ? (
                <span
                  className={
                    isLast ? "app-breadcrumb-current" : "app-breadcrumb-text"
                  }
                  aria-current={isLast ? "page" : undefined}
                >
                  {isHome && (
                    <FaHome
                      className="app-breadcrumb-home"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to} className="app-breadcrumb-link">
                  {isHome && (
                    <FaHome
                      className="app-breadcrumb-home"
                      aria-hidden="true"
                    />
                  )}
                  {crumb.label}
                </Link>
              )}

              {!isLast && (
                <IoIosArrowForward
                  className="app-breadcrumb-sep"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ServiceBreadcrumbs;
