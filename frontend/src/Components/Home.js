import React, { useEffect, useState } from "react";
import Header from "./Header";
import "./sidebar.css";
import { Link } from "react-router-dom";
import Sidebarr from "./Sidebar";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import ChartComponent from "./page/ChartComponent";
import toast, { Toaster } from "react-hot-toast";

const Home = () => {
 

  // const paymentrequest = (e) => {
  //   e.preventDefault();
  //   const data = {
  //     adminId: adminidd,
  //     amount: amount,
  //   };
  //   axios
  //     .post(`${process.env.REACT_APP_API_KEY}admin/api/withdrawRequest`, data)
  //     .then((res) => {
  //       toast.success(res.data.message);
  //     })
  //     .catch((error) => {
  //       if (error.response && error.response.status === 400) {
  //         toast.error(error.response.data.message);
  //       } else {
  //         toast.error("Invalid Data Entered by you.");
  //       }
  //     });
  // };

  return (
    <div>
      {/* <Header /> */}
      <Toaster />
      <div className="dashboard-home">
        <div className="dashboard-home-inner">
          <div className="mt-3 mb-5">
            <div className="page-header pb-0 border-0 mb-3 mt-3 ">
              <div className="flex-between row align-items-center mx-1">
                <div>
                  <h2 className="page-header-title">Dashboard</h2>
                </div>
              </div>
            </div>
            <div className="row g-2" id="order_stats">
              <div className="col-sm-6 col-lg-3">
                <div className="business-analytics">
                  <h5 className="business-analytics__subtitle">Total Sale</h5>
                  <h2 className="business-analytics__title">${"1000"}</h2>
                  <img width={30} height={30}
                    src="/img/incentive.png"
                    className="business-analytics__img"
                    alt
                  />
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="business-analytics">
                  <h5 className="business-analytics__subtitle">Total Stores</h5>
                  <h2 className="business-analytics__title">{"1000"}</h2>
                  <img width={30} height={30}
                    src="/img/store.png"
                    className="business-analytics__img"
                    alt
                  />
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="business-analytics">
                  <h5 className="business-analytics__subtitle">
                    Total Products
                  </h5>
                  <h2 className="business-analytics__title">{"1000"}</h2>
                  <img width={30} height={30}
                    src="/img/box.png"
                    className="business-analytics__img"
                    alt
                  />
                </div>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link to="#">
                  <div className="business-analytics">
                    <h5 className="business-analytics__subtitle">
                      Total Customers
                    </h5>
                    <h2 className="business-analytics__title">{"1000"}</h2>
                    <img width={30} height={30}
                      src="/img/customer-service.png"
                      className="business-analytics__img"
                      alt
                    />
                  </div>
                </Link>
              </div>

              {/* <div className="col-sm-6  col-lg-3">
                <Link to="/overviewsale">
                  <div className="business-analytics">
                    <h5 className="business-analytics__subtitle">
                      Sales Overview
                    </h5>
                    <h2 className="business-analytics__title">0</h2>
                    <img
                      src="./sign.png"
                      className="business-analytics__img"
                      alt
                    />
                  </div>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <div className="business-analytics">
                  <h5 className="business-analytics__subtitle">
                    Current sales{" "}
                  </h5>
                  <h2 className="business-analytics__title">0</h2>
                  <img
                    src="./graph.png"
                    className="business-analytics__img"
                    alt
                  />
                </div>
              </div> */}
              {/* <div className="col-sm-6 col-lg-3">
                <div className="business-analytics">
                  <h5 className="business-analytics__subtitle">
                    Today’s sales
                  </h5>
                  <h2 className="business-analytics__title">0</h2>
                  <img
                    src="./acquisition.png"
                    className="business-analytics__img"
                    alt
                  />
                </div>
              </div> */}

              {/* <hr /> */}

              <div className="col-sm-6 col-lg-3 ">
                <Link className="order-stats order-stats_pending" to="#">
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/expired.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Pending</h6>
                  </div>
                  <span className="order-stats__title">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_confirmed"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/check.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Confirmed</h6>
                  </div>
                  <span className="order-stats__title">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_packaging"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/package.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Packaging</h6>
                  </div>
                  <span className="order-stats__title">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_out-for-delivery"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/transport.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Shipped</h6>
                  </div>
                  <span className="order-stats__title">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_delivered cursor-pointer"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/shipped.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Delivered</h6>
                  </div>
                  <span className="order-stats__title">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_canceled cursor-pointer"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/cancel.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Canceled</h6>
                  </div>
                  <span className="order-stats__title h3">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_returned cursor-pointer"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/return.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">Returned</h6>
                  </div>
                  <span className="order-stats__title h3">{"1000"}</span>
                </Link>
              </div>
              <div className="col-sm-6 col-lg-3">
                <Link
                  className="order-stats order-stats_failed cursor-pointer"
                  to="#"
                >
                  <div
                    className="order-stats__content"
                    style={{ textAlign: "left" }}
                  >
                    <img
                      width={20}
                      src="/img/do-not-iron.png"
                      alt
                    />
                    <h6 className="order-stats__subtitle">
                      Not Delivered
                    </h6>
                  </div>
                  <span className="order-stats__title h3">{"1000"}</span>
                </Link>
              </div>
            </div>

            <div className="card mt-3 mb-3 remove-card-shadow">
              <div className="card-body">
                <div className="row justify-content-between align-items-center g-2 mb-3">
                  <div className="col-sm-6">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        width={20}
                        className="mb-1"
                        src="/img/wallet.png"
                        alt
                      />
                      Admin Wallet
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
                          src="/img/atm.png"
                          alt
                        />
                        <h3 className="for-card-count mb-0 fz-24">${"2000"}</h3>
                        {/* <div className="font-weight-bold text-capitalize mb-30">
                          Withdrawable balance
                        </div> */}
                        <div className="font-weight-bold text-capitalize mb-30">
                          Balance
                        </div>
                        {/* <Link
                          to="#"
                          href="javascript:"
                          className="btn btn--primary px-4"
                          data-toggle="modal"
                              data-target="#balance-modal"
                        >
                          Withdraw
                        </Link> */}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-8">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">${"2000"}</h3>
                              <div className="text-capitalize mb-0">
                                Pending Withdraw
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                className="mb-2"
                                src="/img/time.png"
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
                              <h3 className="mb-1 fz-24">${"2000"
                              }</h3>
                              <div className="text-capitalize mb-0">
                                Total Commission taken
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="/img/commission.png"
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
                              <h3 className="mb-1 fz-24">${"2000"}</h3>
                              <div className="text-capitalize mb-0">
                                Already Withdrawn
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="/img/commission1.png"
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
                              <h3 className="mb-1 fz-24">${"2000"}</h3>
                              <div className="text-capitalize mb-0">
                                Total delivery charge earned
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="/img/not-delivered.png"
                                alt
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">$00.00</h3>
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
                      </div> */}
                      <div className="col-md-6">
                        <div className="card card-body h-100 justify-content-center">
                          <div className="d-flex gap-2 justify-content-between align-items-center">
                            <div className="d-flex flex-column align-items-start">
                              <h3 className="mb-1 fz-24">${"2000"}</h3>
                              <div className="text-capitalize mb-0">
                                Collected cash
                              </div>
                            </div>
                            <div>
                              <img
                                width={40}
                                src="/img/data-collection.png"
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
              <ChartComponent />

              {/* <div className="col-lg-12 mb-3">
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
                    <ChartComponent/>
                  </div>
                </div>
              </div> */}
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-6 col-xl-6">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img width={20}
                        src="/img/rank.png"
                        alt
                      />
                      Top customer
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="grid-card-wrap">
                          <Link
                            to="/Customerdetails"
                           >

                            <div
                              className="cursor-pointer"
                              onclick="location.href='https://6valley.6amtech.com/admin/customer/view/2'"
                            >
                              <div className="grid-card basic-box-shadow">
                                <div className="text-center">
                                  {/* {topdata?.user_profile === " " ? ( */}
                                    <img
                                      className="avatar rounded-circle avatar-lg"
                                      src="https://6valley.6amtech.com/storage/app/public/profile/2022-04-20-625fa7d513aa5.png"
                                      alt="Image"
                                    />
                                  {/* ) : (
                                    <img
                                      className="avatar rounded-circle avatar-lg"
                                      src={
                                        `${process.env.REACT_APP_API_KEY}uploads/` +
                                        topdata?.user_profile
                                      }
                                      alt="Image"
                                    />
                                  )} */}



                                </div>
                                <h5 className="mb-0">{"hello"}</h5>
                                <div className="orders-count d-flex gap-1">
                                  <div>Orders : </div>
                                  <div>{"hello"}</div>
                                </div>
                              </div>
                            </div>
                          </Link>
                    </div>
                  </div>
                </div>
              </div>
              {/* ----------------------- */}

              <div className="col-md-6 col-lg-6 col-xl-6">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header gap-10">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img width={20}
                        src="/img/like.png"
                        alt
                      />
                      Most Popular Stores
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="grid-item-wrap">
                 
                          <Link
                            to="/sallerdetails"
                            className="grid-item basic-box-shadow"
                          >
                            <div className="d-flex align-items-center gap-10">
                              {/* <img
                                src={
                                  mostpop?.shop_logo
                                    ? `${process.env.REACT_APP_API_KEY}uploads/${mostpop?.shop_logo}`
                                    : "https://6valley.6amtech.com/storage/app/public/shop/2022-04-21-6260f790349f7.png"
                                }
                                className="avatar rounded-circle avatar-sm"
                              /> */}
                              <h5 className="shop-name">rrr</h5>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <h5 className="shop-sell c2">5555</h5>
                              <img
                                src="https://6valley.6amtech.com/public/assets/back-end/img/love.png"
                                alt
                              />
                            </div>
                          </Link>
                 
                    </div>
                  </div>
                </div>
              </div>
              {/* ----------------------- */}

              <div className="col-md-6 col-lg-6 col-xl-6">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header gap-10">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        width={20}
                        src="/img/star.png"
                        alt
                      />
                      Top selling store
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="grid-item-wrap">
                     
                          <Link 
                            to="/sallerdetails">


                            <div
                              className="cursor-pointer"
                              onclick="locatioLink.to='/sallerdetails'"
                            >
                              <div className="grid-item basic-box-shadow">
                                <div className="d-flex align-items-center gap-10">
                                  {/* <img
                                    className="avatar rounded-circle avatar-sm"
                                    src={
                                      topselling?.shop_logo
                                        ? `${process.env.REACT_APP_API_KEY}uploads/${topselling?.shop_logo}`
                                        : "https://6valley.6amtech.com/storage/app/public/shop/2022-04-21-6260f790349f7.png"
                                    }
                                  /> */}
                                  <h5 className="shop-name">
                                    {"hhhh"}
                                  </h5>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <h5 className="shop-sell">
                                    {"hhhh"}
                                  </h5>
                                  {/* <h5 className="shop-sell">$00.00</h5> */}
                                  <img
                                    src="https://6valley.6amtech.com/public/assets/back-end/img/cart.png"
                                    alt
                                  />
                                </div>
                              </div>
                            </div>
                          </Link>
                       
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-6 col-xl-6">
                <div className="card h-100 remove-card-shadow">
                  <div className="card-header">
                    <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                      <img
                        width={20}
                        src="/img/popularity.png"
                        alt
                      />
                      Top selling products
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="grid-item-wrap">
                    
                          <Link to="/productsdetails"
                          >
                            <div
                              className="cursor-pointer"
                              onclick="location.href='https://6valley.6amtech.com/seller/product/view/49'"
                            >
                              <div className="grid-item bg-transparent basic-box-shadow">
                                <div className="d-flex align-items-center gap-10">
                                  {/* <img
                                    className="avatar avatar-lg rounded avatar-bordered"
                                    src={
                                      topsproducts?.image1
                                        ? `${process.env.REACT_APP_API_KEY}uploads/${topsproducts?.image1}`
                                        : "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2022-10-12-6346670e3427e.png"
                                    }
                                    alt="women's shoes image"
                                  /> */}
                                  <span className="title-color">
                                    {"eee"}
                                  </span>
                                </div>
                                <div className="orders-count py-2 px-3 d-flex gap-1">
                                  <div>Sold :</div>
                                  <div className="sold-count">
                                    {"eee"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-3 g-2">
              {/* <div className="col-lg-12">
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
              </div> */}
              {/* <div className="col-lg-6 col-md-6">
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
                            <div className="sold-count">0</div>
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
                            <div className="sold-count">0</div>
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
                            <div className="sold-count">0</div>
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
                            <div className="sold-count">0</div>
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
                            <div className="sold-count">0</div>
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
                            <div className="sold-count">0</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="col-lg-6 col-md-6">
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
                          {mostpopproducts?.map((mostpop)=>{
                            return(
                              <Link to="/productsdetails"
                              onClick={() => {
                                secureLocalStorage.setItem("productid", mostpop?.productId);
                              }}>
                            <div
                              className="cursor-pointer grid-card basic-box-shadow"
                              onclick="location.href='https://6valley.6amtech.com/seller/product/view/47'"
                            >
                              <div className>
                                <img
                                  className="avatar avatar-bordered border-gold avatar-60 rounded"
                                  src={mostpop?.image1 ? `${process.env.REACT_APP_API_KEY}uploads/${mostpop?.image1}` : "https://6valley.6amtech.com/storage/app/public/product/thumbnail/2023-06-13-6488413bebea3.png"}

                                  alt="Premium Business presentation file image"
                                />
                              </div>
                              <div className="fz-12 title-color text-center">
                                {mostpop?.product_name}
                              </div>
                              <div className="d-flex align-items-center gap-1 fz-10">
                                <span className="rating-color d-flex align-items-center font-weight-bold gap-1">
                                <img src="https://6valley.6amtech.com/public/assets/back-end/img/love.png"/> {mostpop?.count}
                                </span>
                                
                              </div>
                            </div>
                            </Link>)
                          })}
                          
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
              {/* <div className="col-lg-6 col-md-6">
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
                            <div>0</div>
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
                            <div>0</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
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
            <form>
              <div className="modal-body">
                {/* <div className>
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
                      </div> */}
                <div className id="method-filed__div"></div>
                <div className="mt-1">
                  <label
                    htmlFor="recipient-name"
                    className="col-form-label fz-16"
                  >
                    Amount : {"2000"}
                  </label>
                  <input
                    required
                    value={2000}
                 
                    type="number"
                    name="amount"
                    step=".01"
                    placeholder={"2000"}
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
    </div>
  );
};

export default Home;
