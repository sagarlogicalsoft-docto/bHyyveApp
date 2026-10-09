import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import axios from "axios";

const ChartComponent = () => {
  const [data, setData] = useState(null);
 
  const [selectedFilter, setSelectedFilter] = useState("2");
  const chartContainer = useRef(null);
  const [chart, setChart] = useState(null);

  useEffect(() => {
    getGraphData();
  }, [selectedFilter]);

  useEffect(() => {
    if (data) {
      updateChart();
    }
  }, [data]);

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.dataset.earnType);
  };

  if (selectedFilter === "1") {
  }
  const getGraphData = () => {
    const data = {
      status: selectedFilter,
    };

    axios
      .post(`${process.env.REACT_APP_API_KEY}admin/api/graphData`, data)
      .then((res) => {
        if (selectedFilter === "1") {
          setData(res.data.data);
        } else if (selectedFilter === "2") {
          let abbreviatedData = {};
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          for (const [key, value] of Object.entries(res.data.data)) {
            let abbreviatedKey = key.slice(0, 3);
            abbreviatedData[abbreviatedKey] = value;
          }

          setData(abbreviatedData);
        } else if (selectedFilter === "3") {
          const reversedData = Object.fromEntries(
            Object.entries(res.data.data).reverse()
          );
          setData(reversedData);
        }
      })
      .catch((error) => {});
  };

  const updateChart = () => {
    if (chart) {
      chart.destroy();
    }

    const ctx = chartContainer.current.getContext("2d");

    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data).map((date) => date),
        datasets: [
          {
            label: "Total Sales",
            data: Object.values(data).map((entry) => entry.totalSales),
            backgroundColor: "#0177cd",
            borderColor: "#0177cd",
            borderWidth: 1,
          },
          {
            label: "Commission",
            data: Object.values(data).map((entry) => entry.commission),
            backgroundColor: "#fd7e14",
            borderColor: "#fd7e14",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChart(newChart);
  };

  return (
    <div className="col-lg-12 mb-3">
      <div className="card h-100 remove-card-shadow">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-md-6">
              <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                <img width={20}
                  src="/img/commission1.png"
                  alt="Earning statistics"
                />
                Earning statistics
              </h4>
            </div>
            <div className="col-md-6 d-flex justify-content-md-end">
              <ul className="option-select-btn">
                <li>
                  <label className="basic-box-shadow">
                    <input
                      type="radio"
                      name="statistics2"
                      hidden
                      defaultChecked
                      data-earn-type="2"
                      onChange={handleFilterChange}
                    />
                    <span>This Year</span>
                  </label>
                </li>
                <li>
                  <label className="basic-box-shadow">
                    <input
                      type="radio"
                      name="statistics2"
                      hidden
                      data-earn-type="3"
                      onChange={handleFilterChange}
                    />
                    <span>This Month</span>
                  </label>
                </li>
                <li>
                  <label className="basic-box-shadow">
                    <input
                      type="radio"
                      name="statistics2"
                      hidden
                      data-earn-type="1"
                      onChange={handleFilterChange}
                    />
                    <span>This Week</span>
                  </label>
                </li>
              </ul>
            </div>
          </div>
          {/* <div className="chartjs-custom mt-2" id="set-new-graph">
            <canvas
              ref={chartContainer}
              id="updatingData"
              className="earningShow chartjs-custom mt-2"
            />
          </div> */}

          <div
            className="chartjs-custom mt-2"
            id="set-new-graph"
            style={{ position: "relative", zIndex: "0" }}
          >
            <canvas
              ref={chartContainer}
              id="updatingData"
              className="earningShow chartjs-custom mt-2"
              style={{ display: "block", width: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
