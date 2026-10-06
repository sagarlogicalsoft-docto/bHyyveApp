import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../config/api";
import {
  FaArrowUp,
  FaArrowDown,
  FaUtensils,
  FaBoxOpen,
  FaShoppingCart,
  FaStore,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaMotorcycle,
  FaChartLine,
  FaCalendarDay,
  FaReceipt,
  FaShoppingBag,
} from "react-icons/fa";

import "./restaurantDashboard.css";

const RestaurantDashboard = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("Year");
  const [summaryPeriod, setSummaryPeriod] = useState("This Year");
  const [summaryDay, setSummaryDay] = useState("today");

  const [dashboardData, setDashboardData] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [salesChart, setSalesChart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const getSummaryFilter = (period) => {
    if (period === "This Month") return "this_month";
    if (period === "This Week") return "this_week";

    return "this_year";
  };

  const getRevenueFilter = (period) => {
    if (period === "Month") return "this_month";
    if (period === "Week") return "this_week";

    return "this_year";
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);

        const response = await api.get("/restaurant/dashboard");

        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const response = await api.post("/restaurant/dashboard/order-stats", {
          filter: getSummaryFilter(summaryPeriod),
        });

        setOrderStats(response.data.counts);
      } catch (error) {
        console.error("Order Stats API Error:", error);
      }
    };

    fetchOrderStats();
  }, [summaryPeriod]);

  useEffect(() => {
    const fetchSalesChart = async () => {
      try {
        const response = await api.post("/restaurant/dashboard/sales-chart", {
          filter: getRevenueFilter(revenuePeriod),
        });

        setSalesChart(response.data);
      } catch (error) {
        console.error("Sales Chart API Error:", error);
      }
    };

    fetchSalesChart();
  }, [revenuePeriod]);

  // --------------------------------------------------
  // TOP DASHBOARD CARDS
  // --------------------------------------------------

  const topCards = [
    {
      title: "All Restaurants",
      value: dashboardData?.restaurant ?? 0,
      subtitle: `${dashboardData?.restaurant ?? 0} Newly added`,
      icon: <FaUtensils />,
      trend: "+12.5%",
      trendType: "up",
    },
    {
      title: "Items",
      value: dashboardData?.total_items ?? 0,
      subtitle: `${dashboardData?.itemCount ?? 0} Newly added`,
      icon: <FaBoxOpen />,
      trend: "+8.2%",
      trendType: "up",
    },
    {
      title: "Orders",
      value: dashboardData?.orderCount ?? 0,
      subtitle: `${dashboardData?.orderCount ?? 0} Total orders`,
      icon: <FaShoppingCart />,
      trend: "+15.4%",
      trendType: "up",
    },
    {
      title: "Restaurant Earning",
      value: `$ ${Number(dashboardData?.totalEarning ?? 0).toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        },
      )}`,
      subtitle: "Total revenue",
      icon: <FaStore />,
      trend: "-4.8%",
      trendType: "down",
    },
  ];

  // --------------------------------------------------
  // ORDER STATUS CARDS
  // --------------------------------------------------

  const orderCounts = orderStats || {
    pending: 0,
    accepted: 0,
    cancelled: 0,
    preparing: 0,
    ready_for_pickup: 0,
    picked_up: 0,
    on_the_way: 0,
    delivered: 0,
    rejected: 0,
  };

  const orderCards = [
    {
      title: "Pending Orders",
      value: orderCounts.pending,
      icon: <FaClock />,
      type: "normal",
      path: "/restaurant/orders/pending",
    },
    {
      title: "Accepted Orders",
      value: orderCounts.accepted,
      icon: <FaCheckCircle />,
      type: "success",
      path: "/restaurant/orders/accepted",
    },
    {
      title: "Cancelled Orders",
      value: orderCounts.cancelled,
      icon: <FaTimesCircle />,
      type: "normal",
      path: "/restaurant/orders/cancelled",
    },
    {
      title: "Preparing Orders",
      value: orderCounts.preparing,
      icon: <FaBoxOpen />,
      type: "success",
      path: "/restaurant/orders/preparing",
    },
    {
      title: "Ready For Pickup",
      value: orderCounts.ready_for_pickup,
      icon: <FaCheckCircle />,
      type: "success",
      path: "/restaurant/orders/ready_for-pickup",
    },
    {
      title: "Picked Up Orders",
      value: orderCounts.picked_up,
      icon: <FaTimesCircle />,
      type: "danger",
      path: "/restaurant/orders/picked_up",
    },
    {
      title: "On The Way Orders",
      value: orderCounts.on_the_way,
      icon: <FaTruck />,
      type: "danger",
      path: "/restaurant/orders/on_the_way",
    },
    {
      title: "Delivered Orders",
      value: orderCounts.delivered,
      icon: <FaTruck />,
      type: "danger",
      path: "/restaurant/orders/delivered",
    },
    {
      title: "Driver/Rejected",
      value: orderCounts.rejected,
      icon: <FaMotorcycle />,
      type: "danger",
      path: "/restaurant/orders/driver_rejected",
    },
  ];

  // --------------------------------------------------
  // TODAY'S SUMMARY DATA
  // --------------------------------------------------

  const summaryData = {
    today: {
      title: "Today's Performance",
      orders: "18",
      sales: "$ 1,849.50",
      completed: "14",
      cancelled: "2",
      orderChange: "+12.5%",
      salesChange: "+8.7%",
      completedChange: "+5.2%",
      cancelledChange: "-3.1%",
    },

    yesterday: {
      title: "Yesterday's Performance",
      orders: "16",
      sales: "$ 1,625.40",
      completed: "13",
      cancelled: "3",
      orderChange: "+8.2%",
      salesChange: "+6.4%",
      completedChange: "+4.1%",
      cancelledChange: "-2.5%",
    },

    twoDaysAgo: {
      title: "2 Days Ago Performance",
      orders: "14",
      sales: "$ 1,480.25",
      completed: "11",
      cancelled: "2",
      orderChange: "+5.6%",
      salesChange: "+3.8%",
      completedChange: "+4.7%",
      cancelledChange: "-1.8%",
    },
  };

  const selectedSummary = summaryData[summaryDay];

  const todaysSummary = [
    {
      title: "Today's Orders",
      value: selectedSummary.orders,
      change: selectedSummary.orderChange,
      type: "up",
      icon: <FaReceipt />,
    },
    {
      title: "Today's Sales",
      value: selectedSummary.sales,
      change: selectedSummary.salesChange,
      type: "up",
      icon: <FaChartLine />,
    },
    {
      title: "Completed Orders",
      value: selectedSummary.completed,
      change: selectedSummary.completedChange,
      type: "up",
      icon: <FaCheckCircle />,
    },
    {
      title: "Cancelled Orders",
      value: selectedSummary.cancelled,
      change: selectedSummary.cancelledChange,
      type: "down",
      icon: <FaTimesCircle />,
    },
  ];

  // --------------------------------------------------
  // REVENUE DATA
  // --------------------------------------------------

  const revenueData = useMemo(() => {
    if (!salesChart) {
      return {
        labels: [],
        values: [],
        max: 100,
      };
    }

    const values = salesChart.values || [];

    const highestValue = Math.max(...values, 0);

    return {
      labels: salesChart.labels || [],
      values,
      max: highestValue > 0 ? highestValue : 100,
    };
  }, [salesChart]);

 
 // --------------------------------------------------
// SVG GRAPH CALCULATION
// --------------------------------------------------

const chartWidth = 1200;
const chartHeight = 390;

const chartPadding = {
  top: 30,
  right: 30,
  bottom: 55,
  left: 70,
};

const innerWidth =
  chartWidth - chartPadding.left - chartPadding.right;

const innerHeight =
  chartHeight - chartPadding.top - chartPadding.bottom;

const points = revenueData.values.map((value, index) => {
  const totalPoints = revenueData.values.length;

  const x =
    totalPoints === 1
      ? chartPadding.left + innerWidth / 2
      : chartPadding.left +
        (index / (totalPoints - 1)) * innerWidth;

  const y =
    chartPadding.top +
    innerHeight -
    (value / revenueData.max) * innerHeight;

  return {
    x,
    y,
    value,
  };
});

const linePath =
  points.length > 0
    ? points
        .map((point, index) => {
          if (index === 0) {
            return `M ${point.x} ${point.y}`;
          }

          const previous = points[index - 1];

          const controlPoint1X =
            previous.x + (point.x - previous.x) / 2;

          const controlPoint2X =
            previous.x + (point.x - previous.x) / 2;

          return `
            C
            ${controlPoint1X} ${previous.y},
            ${controlPoint2X} ${point.y},
            ${point.x} ${point.y}
          `;
        })
        .join(" ")
    : "";

const areaPath =
  points.length > 0
    ? `
      ${linePath}
      L ${points[points.length - 1].x}
        ${chartPadding.top + innerHeight}
      L ${points[0].x}
        ${chartPadding.top + innerHeight}
      Z
    `
    : "";

const gridValues = [
  revenueData.max,
  revenueData.max * 0.75,
  revenueData.max * 0.5,
  revenueData.max * 0.25,
  0,
];

// Skip labels on x-axis when there are too many points, to avoid overlap
const maxLabelsToShow = 8;
const labelStep = Math.max(1, Math.ceil(points.length / maxLabelsToShow));

  return (
    <div className="restaurant-dashboard">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="restaurant-dashboard-header">
        <div>
          <div className="restaurant-dashboard-title">
            <span className="dashboard-title-icon">🥦</span>

            <h1>Restaurant Dashboard</h1>
          </div>

          <p className="dashboard-subtitle">
            Overview of your restaurant performance and orders.
          </p>
        </div>
      </div>

      {/* =========================================
          TOP SUMMARY CARDS
      ========================================= */}

      <section className="dashboard-main-card">
        {/* PERIOD FILTER */}
        <div className="dashboard-period-filter">
          {["This Year", "This Month", "This Week"].map((period) => (
            <button
              key={period}
              type="button"
              className={summaryPeriod === period ? "active" : ""}
              onClick={() => setSummaryPeriod(period)}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="top-summary-grid">
          {topCards.map((card, index) => (
            <div className="restaurant-summary-card" key={index}>
              <div className="summary-card-icon">{card.icon}</div>

              <h3>{card.title}</h3>

              <div className="summary-card-value">{card.value}</div>

              <p>{card.subtitle}</p>

              {/* <div className={`summary-card-trend ${card.trendType}`}>
                {card.trendType === "up" ? <FaArrowUp /> : <FaArrowDown />}

                <span>{card.trend}</span>

                <small>vs last period</small>
              </div> */}
            </div>
          ))}
        </div>

        {/* =========================================
            ORDER STATUS GRID
        ========================================= */}

        <div className="order-status-grid">
          {orderCards.map((card, index) => (
            <Link
              to={card.path}
              className={`order-status-card ${card.type}`}
              key={index}
            >
              <div className="order-status-left">
                <span className="order-status-icon">{card.icon}</span>

                <span className="order-status-title">{card.title}</span>
              </div>

              <span className="order-status-value">{card.value}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================
          REVENUE GRAPH
      ========================================= */}

    {/* =========================================
    REVENUE GRAPH
========================================= */}

<section className="revenue-card">
  <div className="revenue-card-header">
    <div>
      <span className="revenue-label">TOTAL REVENUE</span>

      <h2>$ {salesChart?.grand_total || "0.00"}</h2>
    </div>

    <div className="revenue-period-tabs">
      {["Year", "Month", "Week"].map((period) => (
        <button
          key={period}
          type="button"
          className={revenuePeriod === period ? "active" : ""}
          onClick={() => setRevenuePeriod(period)}
        >
          {period}
        </button>
      ))}
    </div>
  </div>

  <div className="revenue-chart-wrapper">
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      preserveAspectRatio="none"
      className="revenue-chart"
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7063ee" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#7063ee" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* GRID */}

      {gridValues.map((value, index) => {
        const y =
          chartPadding.top +
          innerHeight -
          (value / revenueData.max) * innerHeight;

        return (
          <g key={index}>
            <line
              x1={chartPadding.left}
              y1={y}
              x2={chartWidth - chartPadding.right}
              y2={y}
              className="chart-grid-line"
            />

            <text
              x={chartPadding.left - 15}
              y={y + 5}
              textAnchor="end"
              className="chart-y-label"
            >
              {value === 0 ? "$ 0" : `$ ${(value / 1000).toFixed(1)}k`}
            </text>
          </g>
        );
      })}

      {/* AREA */}

      <path d={areaPath} fill="url(#revenueGradient)" className="chart-area" />

      {/* LINE */}

      <path d={linePath} fill="none" className="chart-line" />

      {/* HOVER GUIDE LINE + DOT */}

      {hoveredIndex !== null && points[hoveredIndex] && (
        <g className="chart-hover-guide">
          <line
            x1={points[hoveredIndex].x}
            y1={chartPadding.top}
            x2={points[hoveredIndex].x}
            y2={chartPadding.top + innerHeight}
            className="chart-hover-line"
          />

          <circle
            cx={points[hoveredIndex].x}
            cy={points[hoveredIndex].y}
            r="6"
            className="chart-hover-dot"
          />
        </g>
      )}

      {/* HOVER HIT AREAS (invisible) */}

      {points.map((point, index) => (
        <rect
          key={`hit-${index}`}
          x={
            index === 0
              ? chartPadding.left
              : (points[index - 1].x + point.x) / 2
          }
          y={chartPadding.top}
          width={
            points.length === 1
              ? innerWidth
              : index === 0
              ? (points[1].x - point.x) / 2 +
                (point.x - chartPadding.left)
              : index === points.length - 1
              ? chartWidth -
                chartPadding.right -
                (points[index - 1].x + point.x) / 2
              : (points[index + 1].x - points[index - 1].x) / 2
          }
          height={innerHeight}
          fill="transparent"
          onMouseEnter={() => setHoveredIndex(index)}
          style={{ cursor: "pointer" }}
        />
      ))}

      {/* X AXIS LABELS */}

      {points.map((point, index) => {
        const isLast = index === points.length - 1;
        const shouldShow = index % labelStep === 0 || isLast;

        if (!shouldShow) return null;

        return (
          <text
            key={index}
            x={point.x}
            y={chartHeight - 18}
            textAnchor="middle"
            className={`chart-x-label ${
              hoveredIndex === index ? "chart-x-label--active" : ""
            }`}
          >
            {revenueData.labels[index]}
          </text>
        );
      })}
    </svg>

    {/* TOOLTIP */}

    {hoveredIndex !== null && points[hoveredIndex] && (
      <div
        className="chart-tooltip chart-tooltip--below"
        style={{
          left: `${(points[hoveredIndex].x / chartWidth) * 100}%`,
          top: `${(points[hoveredIndex].y / chartHeight) * 100}%`,
        }}
      >
        <span className="chart-tooltip-label">
          {revenueData.labels[hoveredIndex]}
        </span>

        <span className="chart-tooltip-value">
          ${" "}
          {Number(points[hoveredIndex].value).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
    )}
  </div>
</section>


      {/* =========================================
    TODAY'S SUMMARY
========================================= */}

      <section className="today-summary-section">
        <div className="today-summary-header">
          <div>
            <span className="today-summary-label">TODAY'S SUMMARY</span>

            <h2>{selectedSummary.title}</h2>
          </div>

          <div className="today-summary-date">
            <FaCalendarDay />

            <select
              value={summaryDay}
              onChange={(e) => setSummaryDay(e.target.value)}
              className="today-summary-select"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="twoDaysAgo">2 Days Ago</option>
            </select>
          </div>
        </div>

        <div className="today-summary-grid">
          {todaysSummary.map((item, index) => (
            <div className="today-summary-card" key={index}>
              <div className="today-summary-icon">{item.icon}</div>

              <div className="today-summary-content">
                <span>{item.title}</span>

                <strong>{item.value}</strong>

                <div className={`today-summary-change ${item.type}`}>
                  {item.type === "up" ? <FaArrowUp /> : <FaArrowDown />}

                  {item.change}

                  <small> vs previous day</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RestaurantDashboard;
