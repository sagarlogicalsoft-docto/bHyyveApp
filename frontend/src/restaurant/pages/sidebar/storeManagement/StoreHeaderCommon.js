import React from "react";
import {
  FaArrowLeft,
  FaStore,
  FaShoppingBag,
  FaBoxOpen,
  FaStar,
  FaExchangeAlt,
  FaMoneyBillWave,
  FaEdit,
  FaTags,
} from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./storeView.css";
import Breadcrumbs from "../../common/BreadCrumbs";

const StoreHeaderCommon = ({
  storeName = "N/A",
  storeId,
  storeStatus = "Inactive",
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const currentStoreId = storeId || id;

  const tabs = [
    {
      label: "Overview",
      icon: <FaStore />,
      path: `/restaurant/store/view_store/${currentStoreId}`,
    },
    {
      label: "Orders",
      icon: <FaShoppingBag />,
      path: `/restaurant/store/orders/${currentStoreId}`,
    },
    {
      label: "Items",
      icon: <FaBoxOpen />,
      path: `/restaurant/store/items/${currentStoreId}`,
    },
    {
      label: "Reviews",
      icon: <FaStar />,
      path: `/restaurant/store/reviews/${currentStoreId}`,
    },
    {
      label: "Discounts",
      icon: <FaMoneyBillWave />,
      path: `/restaurant/store/discounts/${currentStoreId}`,
    },
    {
      label: "Transactions",
      icon: <FaExchangeAlt />,
      path: `/restaurant/store/transactions/${currentStoreId}`,
    },
  ];

  const keywordPath = `/restaurant/store/keywords/${currentStoreId}`;

  const isOverview =
    location.pathname === `/restaurant/store/view_store/${currentStoreId}`;

  const isKeywordActive = location.pathname === keywordPath;

  return (
    <>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="store-view-header">
        <div className="store-view-heading-row">
          <div className="store-view-heading-left">
            <div className="store-view-heading-icon">
              <FaStore />
            </div>

            <div>
              <h1>{storeName}</h1>

              <div className="store-view-meta">
                <span>Store ID: {currentStoreId}</span>

                <span
                  className={`store-status-badge ${storeStatus.toLowerCase()}`}
                >
                  <span className="status-dot"></span>
                  {storeStatus}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* EDIT STORE - SHOW ON ALL PAGES EXCEPT OVERVIEW */}
            {!isOverview && (
              <button
                type="button"
                className="store-back-button"
                onClick={() =>
                  navigate(`/restaurant/store/edit_store/${currentStoreId}`)
                }
              >
                <FaEdit />
                <span>Edit Store</span>
              </button>
            )}

            {/* BACK TO LIST */}
            <button
              type="button"
              className="store-back-button"
              onClick={() => navigate("/restaurant/stores_list")}
            >
              <FaArrowLeft />
              <span>Back to List</span>
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          STORE TABS + KEYWORD BUTTON (same line)
      ===================================================== */}

      <div className="store-view-tabs-row">
        <div className="store-view-tabs">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            return (
              <button
                type="button"
                key={tab.label}
                className={`store-view-tab ${isActive ? "active" : ""}`}
                onClick={() => navigate(tab.path)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* KEYWORD BUTTON - RIGHT SIDE */}
        <button
          type="button"
          className={`store-keyword-button ${isKeywordActive ? "active" : ""}`}
          onClick={() => navigate(keywordPath)}
        >
          <FaTags />
          <span>Keywords</span>
        </button>
      </div>
    </>
  );
};

export default StoreHeaderCommon;