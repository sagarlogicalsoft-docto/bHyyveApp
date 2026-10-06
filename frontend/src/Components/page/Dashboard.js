import React, { useState } from "react";
import Header from "../Header";
import "../sidebar.css";
import "../dashboard.css";
import Sidebarr from "../Sidebar";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
  window.innerWidth > 767
);
  return (
    <>
      {/* <Header /> */}
      <div
  className={`dashboard-layout ${
    sidebarOpen ? "sidebar-is-open" : "sidebar-is-collapsed"
  }`}
>
  <div className="dashboard-sidebar-container">
          {/* <Sidebarr /> */}
          <Sidebarr sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
       <div className="dashboard-content">
          <div className="">
            <div className="sidenav1"></div>
            <div className="card mb-3 remove-card-shadow">
              <div className="card-body">
                <div className="row justify-content-between align-items-center g-2 mb-3">
                  <div className="col-sm-6">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        src="https://6valley.6amtech.com/public/assets/back-end/img/business_analytics.png"
                        alt
                      />
                      Business analytics
                    </h4>
                  </div>
                  <div className="col-sm-6 d-flex justify-content-sm-end">
                    <select
                      className="custom-select w-auto"
                      name="statistics_type"
                      onchange="order_stats_update(this.value)"
                    >
                      <option value="overall">Overall Statistics</option>
                      <option value="today">Todays Statistics</option>
                      <option value="this_month">This Months Statistics</option>
                    </select>
                  </div>
                </div>
                <div className="row g-2" id="order_stats">
                  <div className="col-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_pending"
                      href="https://6valley.6amtech.com/seller/orders/list/pending"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/pending.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">Pending</h6>
                      </div>
                      <span className="order-stats__title">3</span>
                    </a>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_confirmed"
                      href="https://6valley.6amtech.com/seller/orders/list/confirmed"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/confirmed.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">Confirmed</h6>
                      </div>
                      <span className="order-stats__title">4</span>
                    </a>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_packaging"
                      href="https://6valley.6amtech.com/seller/orders/list/processing"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/packaging.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">Packaging</h6>
                      </div>
                      <span className="order-stats__title">1</span>
                    </a>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_out-for-delivery"
                      href="https://6valley.6amtech.com/seller/orders/list/out_for_delivery"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/out-of-delivery.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">
                          Out For Delivery
                        </h6>
                      </div>
                      <span className="order-stats__title">2</span>
                    </a>
                  </div>
                  <div className="ol-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_delivered"
                      href="https://6valley.6amtech.com/seller/orders/list/delivered"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/delivered.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">Delivered</h6>
                      </div>
                      <span className="order-stats__title">9</span>
                    </a>
                  </div>
                  <div className="ol-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_canceled"
                      href="https://6valley.6amtech.com/seller/orders/list/canceled"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/canceled.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">Canceled</h6>
                      </div>
                      <span className="order-stats__title">1</span>
                    </a>
                  </div>
                  <div className="ol-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_returned"
                      href="https://6valley.6amtech.com/seller/orders/list/returned"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/returned.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">Returned</h6>
                      </div>
                      <span className="order-stats__title">1</span>
                    </a>
                  </div>
                  <div className="ol-sm-6 col-lg-3">
                    <a
                      className="order-stats order-stats_failed"
                      href="https://6valley.6amtech.com/seller/orders/list/failed"
                    >
                      <div className="order-stats__content">
                        <img
                          width={20}
                          src="https://6valley.6amtech.com/public/assets/back-end/img/failed-to-deliver.png"
                          alt
                        />
                        <h6 className="order-stats__subtitle">
                          Failed To Delivery
                        </h6>
                      </div>
                      <span className="order-stats__title">2</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="card mb-3 remove-card-shadow">
              <div className="card-body">
                <div className="row justify-content-between align-items-center g-2 mb-3">
                  <div className="col-sm-6">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        width={20}
                        className="mb-1"
                        src="https://6valley.6amtech.com/public/assets/back-end/img/admin-wallet.png"
                        alt
                      />
                      Seller Wallet
                    </h4>
                  </div>
                </div>
                <div className="row g-2" id="order_stats">
                  <div className="col-lg-4">
                    <div className="card h-100 d-flex justify-content-center align-items-center">
                      <div className="card-body d-flex flex-column gap-10 align-items-center justify-content-center">
                        <img
                          width={48}
                          className="mb-2"
                          src="https://6valley.6amtech.com/public/assets/back-end/img/withdraw.png"
                          alt
                        />
                        <h3 className="for-card-count mb-0 fz-24">$9,573.50</h3>
                        <div className="font-weight-bold text-capitalize mb-30">
                          Withdrawable balance
                        </div>
                        <a
                          href="javascript:"
                          className="btn btn--primary px-4"
                          data-toggle="modal"
                          data-target="#balance-modal"
                        >
                          Withdraw
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$500.00</h3>
                              <div className="text-capitalize mb-0">
                                Pending Withdraw
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                className="mb-2"
                                src="https://6valley.6amtech.com/public/assets/back-end/img/pw.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$6,319.47</h3>
                              <div className="text-capitalize mb-0">
                                Total Commission given
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="https://6valley.6amtech.com/public/assets/back-end/img/tcg.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$600.00</h3>
                              <div className="text-capitalize mb-0">
                                Already Withdrawn
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="https://6valley.6amtech.com/public/assets/back-end/img/aw.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$822.00</h3>
                              <div className="text-capitalize mb-0">
                                Total delivery charge earned
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="https://6valley.6amtech.com/public/assets/back-end/img/tdce.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$2,494.00</h3>
                              <div className="text-capitalize mb-0">
                                Total tax given
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="https://6valley.6amtech.com/public/assets/back-end/img/ttg.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$25,756.80</h3>
                              <div className="text-capitalize mb-0">
                                Collected cash
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="https://6valley.6amtech.com/public/assets/back-end/img/cc.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="modal fade"
              id="balance-modal"
              tabIndex={-1}
              role="dialog"
              aria-hidden="true"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content" style={{ textAlign: "left" }}>
                  <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">
                      Withdraw Request
                    </h5>
                    <button
                      type="button"
                      className="close"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <form
                    action="https://6valley.6amtech.com/seller/withdraw/request"
                    method="post"
                  >
                    <div className="modal-body">
                      <input
                        type="hidden"
                        name="_token"
                        defaultValue="ogOCpmdAJJ38pWdY4o8txAvCPH58PO03n5rkZpRx"
                      />{" "}
                      <div className>
                        <select
                          className="form-control"
                          id="withdraw_method"
                          name="withdraw_method"
                          required
                        >
                          <option value={1} selected>
                            VISA Card
                          </option>
                          <option value={2}>bkash</option>
                          <option value={3}>Bank</option>
                        </select>
                      </div>
                      <div className id="method-filed__div"></div>
                      <div className="mt-1">
                        <label
                          htmlFor="recipient-name"
                          className="col-form-label fz-16"
                        >
                          Amount :
                        </label>
                        <input
                          type="number"
                          name="amount"
                          step=".01"
                          defaultValue="9573.5"
                          className="form-control"
                          id
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        data-dismiss="modal"
                      >
                        Close
                      </button>
                      <button type="submit" className="btn btn--primary">
                        Request
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="row g-2">
              <div className="col-lg-12">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-body">
                    <div className="row g-2 align-items-center">
                      <div className="col-md-6">
                        <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                          <img
                            src="https://6valley.6amtech.com/public/assets/back-end/img/earning_statictics.png"
                            alt
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
                              />
                              <span
                                data-earn-type="yearEarn"
                                onclick="earningStatisticsUpdate(this)"
                              >
                                This Year
                              </span>
                            </label>
                          </li>
                          <li>
                            <label className="basic-box-shadow">
                              <input type="radio" name="statistics2" hidden />
                              <span
                                data-earn-type="MonthEarn"
                                onclick="earningStatisticsUpdate(this)"
                              >
                                This Month
                              </span>
                            </label>
                          </li>
                          <li>
                            <label className="basic-box-shadow">
                              <input type="radio" name="statistics2" hidden />
                              <span
                                data-earn-type="WeekEarn"
                                onclick="earningStatisticsUpdate(this)"
                              >
                                This Week
                              </span>
                            </label>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="chartjs-custom mt-2" id="set-new-graph">
                      <canvas
                        id="updatingData"
                        className="earningShow"
                        data-hs-chartjs-options='{
                                    "type": "bar",
                                    "data": {
                                      "labels": ["Jan","Feb","Mar","April","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                                      "datasets": [{
                                        "label": "Seller",
                                        "data": [
                                                                                                                                                        1971.83,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0
                                                                                    ],
                                                "backgroundColor": "#0177CD",
                                                "borderColor": "#0177CD"
                                              },
                                              {
                                                "label": "Commission",
                                                "data": [
                                                                                                                                                        347.97,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0,
                                                                                0
                                                                                    ],
                                                "backgroundColor": "#FFB36D",
                                                "borderColor": "#FFB36D"
                                              }]
                                            },
                                            "options": {
                                            "legend": {
                                                "display": true,
                                                "position": "top",
                                                "align": "center",
                                                "labels": {
                                                    "usePointStyle": true,
                                                    "boxWidth": 6,
                                                    "fontColor": "#758590",
                                                    "fontSize": 14
                                                }
                                            },
                                              "scales": {
                                                "yAxes": [{
                                                  "gridLines": {
                                                        "color": "rgba(180, 208, 224, 0.5)",
                                                        "borderDash": [8, 4],
                                                        "drawBorder": false,
                                                        "zeroLineColor": "rgba(180, 208, 224, 0.5)"
                                                  },
                                                  "ticks": {
                                                    "beginAtZero": true,
                                                    "fontSize": 12,
                                                    "fontColor": "#97a4af",
                                                    "fontFamily": "Open Sans, sans-serif",
                                                    "padding": 10,
                                                    "postfix": " $"
                                          }
                                        }],
                                        "xAxes": [{
                                          "gridLines": {
                                                "color": "rgba(180, 208, 224, 0.5)",
                                                "display": true,
                                                "drawBorder": true,
                                                "zeroLineColor": "rgba(180, 208, 224, 0.5)"
                                          },
                                          "ticks": {
                                            "fontSize": 12,
                                            "fontColor": "#97a4af",
                                            "fontFamily": "Open Sans, sans-serif",
                                            "padding": 5
                                          },
                                          "categoryPercentage": 0.5,
                                          "maxBarThickness": "7"
                                        }]
                                      },
                                      "cornerRadius": 3,
                                      "tooltips": {
                                        "prefix": " ",
                                        "hasIndicator": true,
                                        "mode": "index",
                                        "intersect": false
                                      },
                                      "hover": {
                                        "mode": "nearest",
                                        "intersect": true
                                      }
                                    }
                                  }'
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        width={20}
                        src="https://6valley.6amtech.com/public/assets/back-end/img/top-selling-product.png"
                        alt
                      />
                      Top selling products
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="grid-item-wrap">
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/product/view/49'"
                      >
                        <div className="grid-item bg-transparent basic-box-shadow">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              className="avatar avatar-lg rounded avatar-bordered"
                              src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2022-10-12-6346670e3427e.png"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                              alt="women's shoes image"
                            />
                            <span className="title-color">women's shoes </span>
                          </div>
                          <div className="orders-count py-2 px-3 d-flex gap-1">
                            <div>Sold :</div>
                            <div className="sold-count">8</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/product/view/9'"
                      >
                        <div className="grid-item bg-transparent basic-box-shadow">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              className="avatar avatar-lg rounded avatar-bordered"
                              src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2023-06-13-64882fd48c1c9.png"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                              alt="LM Washable and Light-Weight Men's Shoe image"
                            />
                            <span className="title-color">
                              LM Washable and Ligh ...
                            </span>
                          </div>
                          <div className="orders-count py-2 px-3 d-flex gap-1">
                            <div>Sold :</div>
                            <div className="sold-count">4</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/product/view/50'"
                      >
                        <div className="grid-item bg-transparent basic-box-shadow">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              className="avatar avatar-lg rounded avatar-bordered"
                              src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2023-06-13-648847880d064.png"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                              alt="Super Portable Electric Iron - Multicolor -007 image"
                            />
                            <span className="title-color">
                              Super Portable Elect ...
                            </span>
                          </div>
                          <div className="orders-count py-2 px-3 d-flex gap-1">
                            <div>Sold :</div>
                            <div className="sold-count">4</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/product/view/47'"
                      >
                        <div className="grid-item bg-transparent basic-box-shadow">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              className="avatar avatar-lg rounded avatar-bordered"
                              src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2023-06-13-6488413bebea3.png"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                              alt="Premium Business presentation file image"
                            />
                            <span className="title-color">
                              Premium Business pre ...
                            </span>
                          </div>
                          <div className="orders-count py-2 px-3 d-flex gap-1">
                            <div>Sold :</div>
                            <div className="sold-count">3</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/product/view/53'"
                      >
                        <div className="grid-item bg-transparent basic-box-shadow">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              className="avatar avatar-lg rounded avatar-bordered"
                              src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2023-06-13-64884db79d7af.png"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                              alt="Klash Flash Melting Matte Waterproof Lip Stick - P09 image"
                            />
                            <span className="title-color">
                              Klash Flash Melting ...
                            </span>
                          </div>
                          <div className="orders-count py-2 px-3 d-flex gap-1">
                            <div>Sold :</div>
                            <div className="sold-count">3</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/product/view/51'"
                      >
                        <div className="grid-item bg-transparent basic-box-shadow">
                          <div className="d-flex align-items-center gap-10">
                            <img
                              className="avatar avatar-lg rounded avatar-bordered"
                              src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2022-10-12-6346833cd4973.png"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                              alt="Ladies Bag image"
                            />
                            <span className="title-color">Ladies Bag </span>
                          </div>
                          <div className="orders-count py-2 px-3 d-flex gap-1">
                            <div>Sold :</div>
                            <div className="sold-count">3</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        width={20}
                        src="https://6valley.6amtech.com/public/assets/back-end/img/most-popular-product.png"
                        alt
                      />
                      Most popular products
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-12">
                        <div className="grid-card-wrap">
                          <div
                            className="cursor-pointer grid-card basic-box-shadow"
                            onclick="location.href='https://6valley.6amtech.com/seller/product/view/47'"
                          >
                            <div className>
                              <img
                                className="avatar avatar-bordered border-gold avatar-60 rounded"
                                src="https://6valley.6amtech.com/storage/app/public/product/thumbnail/2023-06-13-6488413bebea3.png"
                                onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img2.jpg'"
                                alt="Premium Business presentation file image"
                              />
                            </div>
                            <div className="fz-12 title-color text-center">
                              Premium Business presentation ...
                            </div>
                            <div className="d-flex align-items-center gap-1 fz-10">
                              <span className="rating-color d-flex align-items-center font-weight-bold gap-1">
                                <i className="tio-star" />
                                4.5
                              </span>
                              <span className="d-flex align-items-center gap-10">
                                (2 Reviews)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        src="https://6valley.6amtech.com/public/assets/back-end/img/top-customers.png"
                        alt
                      />
                      Top Delivery Man
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="grid-card-wrap">
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/delivery-man/earning-statement/6'"
                      >
                        <div className="grid-card basic-box-shadow">
                          <div className="text-center">
                            <img
                              className="avatar rounded-circle avatar-lg"
                              onclick="location.href='https://6valley.6amtech.com/seller/delivery-man/earning-statement/6'"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img1.jpg'"
                              src="https://6valley.6amtech.com/storage/app/public/delivery-man/2022-10-12-634667a5d9df0.png"
                            />
                          </div>
                          <h5 className="mb-0">Delivery</h5>
                          <div className="orders-count d-flex gap-1">
                            <div>Delivered : </div>
                            <div>2</div>
                          </div>
                        </div>
                      </div>
                      <div
                        className="cursor-pointer"
                        onclick="location.href='https://6valley.6amtech.com/seller/delivery-man/earning-statement/2'"
                      >
                        <div className="grid-card basic-box-shadow">
                          <div className="text-center">
                            <img
                              className="avatar rounded-circle avatar-lg"
                              onclick="location.href='https://6valley.6amtech.com/seller/delivery-man/earning-statement/2'"
                              onerror="this.src='https://6valley.6amtech.com/public/assets/back-end/img/160x160/img1.jpg'"
                              src="https://6valley.6amtech.com/storage/app/public/delivery-man/2022-03-17-6233134e41746.png"
                            />
                          </div>
                          <h5 className="mb-0">supplier</h5>
                          <div className="orders-count d-flex gap-1">
                            <div>Delivered : </div>
                            <div>1</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
