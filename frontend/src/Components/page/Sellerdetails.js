import React from "react";
import "../sidebar.css";
import Header from "../Header";
import swal from "sweetalert";
import { Link } from "react-router-dom";
import Sidebarr from "../Sidebar";
import secureLocalStorage from "react-secure-storage";

const Sellerdetails = () => {
  let deleteproducts = () => {
    swal({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this banner?",
      icon: "success",
      dangerMode: true,
    });
  };


  return (
    <div>
      {/* not for use this component */}
      {/* <Header /> */}
      <div
        className="container row"
        style={{ paddingLeft: "0px", paddingRight: "0px", marginLeft: "0px" }}
      >
        <div className="col-lg-3 col-md-4" style={{ paddingLeft: "0px" }}>
          {/* <Sidebarr /> */}
        </div>

        <div
          className="col-lg-9 col-md-8"
          style={{ paddingLeft: "0px", marginTop: "60px" }}
        >
          <div className="mt-3">
            <div className="mb-3">
              <h2 className="h1 mb-0 d-flex gap-10">
                <img
                  src="https://6valley.6amtech.com/public/assets/back-end/img/brand-setup.png"
                  alt
                />
                Vendor details
              </h2>
            </div>
           


            <div className="page-header border-0 mb-4">
          <div className="js-nav-scroller hs-nav-scroller-horizontal">
            <ul className="nav nav-tabs flex-wrap page-header-tabs">
              <li className="nav-item">
                <a className="nav-link active" href="#">Shop overview</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Order</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Product</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Setting</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Transaction</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Review</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="card card-top-bg-element mb-5">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3 justify-content-between">
              <div className="media flex-column flex-sm-row gap-3">
                <img className="avatar avatar-170 rounded-0" src="https://6valley.6amtech.com/storage/app/public/shop/2023-06-13-64883892c6c11.png" alt="Image" />
                <div className="media-body">
                  <div className="d-block">
                    <h2 className="mb-2 pb-1">Digital House</h2>
                    <div className="d-flex gap-3 flex-wrap mb-3 lh-1">
                      <div className="review-hover position-relative cursor-pointer d-flex gap-2 align-items-center">
                      <i class="fa fa-star" aria-hidden="true"></i>
                        <span>0</span>
                        <div className="review-details-popup">
                          <h6 className="mb-2">Rating</h6>
                          <div className>
                            <ul className="list-unstyled list-unstyled-py-2 mb-0">
                              <li className="d-flex align-items-center font-size-sm">
                                <span className="mr-3">5 Star</span>
                                <div className="progress flex-grow-1">
                                  <div className="progress-bar width--100" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                                <span className="ml-3">0</span>
                              </li>
                              <li className="d-flex align-items-center font-size-sm">
                                <span className="mr-3">4 Star</span>
                                <div className="progress flex-grow-1">
                                  <div className="progress-bar width--80" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                                <span className="ml-3">0</span>
                              </li>
                              <li className="d-flex align-items-center font-size-sm">
                                <span className="mr-3">3 Star</span>
                                <div className="progress flex-grow-1">
                                  <div className="progress-bar width--60" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                                <span className="ml-3">0</span>
                              </li>
                              <li className="d-flex align-items-center font-size-sm">
                                <span className="mr-3">2 Star</span>
                                <div className="progress flex-grow-1">
                                  <div className="progress-bar width--40" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                                <span className="ml-3">0</span>
                              </li>
                              <li className="d-flex align-items-center font-size-sm">
                                <span className="mr-3">2 Star</span>
                                <div className="progress flex-grow-1">
                                  <div className="progress-bar width--20" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
                                </div>
                                <span className="ml-3">0</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <span className="border-left" />
                      <a href="javascript:" className="text-dark">0 Ratings</a>
                      <span className="border-left" />
                      <a href="#" className="text-dark">0 Reviews</a>
                    </div>
                    <a href="#" className="btn btn-outline--primary px-4" ><i class="fa fa-globe" aria-hidden="true"></i> View live
                    </a>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-sm-end flex-wrap gap-2 mb-3">
                <form className="d-inline-block" >
                  <input type="hidden" name="_token" defaultValue="5201ifIgVXHshEaS9xR5L76fdJ1eBw8H5dYCuDvv" autoComplete="off" /> <input type="hidden" name="id" defaultValue={10} />
                  <input type="hidden" name="status" defaultValue="suspended" />
                  <button type="submit" className="btn btn-danger px-5">Suspend this vendor</button>
                </form>
              </div>
            </div>
            <hr />
            <div className="d-flex gap-3 flex-wrap flex-lg-nowrap">
              <div className="border p-3 w-170">
                <div className="d-flex flex-column mb-1">
                  <h6 className="font-weight-normal">Total products :</h6>
                  <h3 className="text-primary fs-18">5</h3>
                </div>
                <div className="d-flex flex-column">
                  <h6 className="font-weight-normal">Total orders :</h6>
                  <h3 className="text-primary fs-18">6</h3>
                </div>
              </div>
              <div className="row gy-3 flex-grow-1 w-100">
                <div className="col-sm-6 col-xxl-3">
                  <h4 className="mb-3 text-capitalize">Shop information</h4>
                  <div className="pair-list">
                    <div>
                      <span className="key text-nowrap">Shop name</span>
                      <span>:</span>
                      <span className="value ">Digital House</span>
                    </div>
                    <div>
                      <span className="key">Phone</span>
                      <span>:</span>
                      <span className="value">01111111111</span>
                    </div>
                    <div>
                      <span className="key">Address</span>
                      <span>:</span>
                      <span className="value">Mirpur</span>
                    </div>
                    <div>
                      <span className="key">Status</span>
                      <span>:</span>
                      <span className="value">
                        <span className="badge badge-info">
                          Active
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xxl-3">
                  <h4 className="mb-3 text-capitalize">Vendor information</h4>
                  <div className="pair-list">
                    <div>
                      <span className="key">Name</span>
                      <span>:</span>
                      <span className="value">Digital Seller</span>
                    </div>
                    <div>
                      <span className="key">Email</span>
                      <span>:</span>
                      <span className="value">seller@seller.com</span>
                    </div>
                    <div>
                      <span className="key">Phone</span>
                      <span>:</span>
                      <span className="value">00111111111</span>
                    </div>
                  </div>
                </div>
                <div className="col-xxl-6">
                  <div className="bg-light p-3 border border-primary-light rounded">
                    <h4 className="mb-3 text-capitalize">Bank information</h4>
                    <div className="d-flex gap-5">
                      <div className="pair-list">
                        <div>
                          <span className="key text-nowrap">Bank name</span>
                          <span className="px-2">:</span>
                          <span className="value ">City Bank</span>
                        </div>
                        <div>
                          <span className="key text-nowrap">Branch</span>
                          <span className="px-2">:</span>
                          <span className="value">City Bank</span>
                        </div>
                      </div>
                      <div className="pair-list">
                        <div>
                          <span className="key text-nowrap">Holder name</span>
                          <span className="px-2">:</span>
                          <span className="value">City Bank</span>
                        </div>
                        <div>
                          <span className="key text-nowrap">A/C No</span>
                          <span className="px-2">:</span>
                          <span className="value">City Bank</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-3 mb-5">
          <div className="card-body">
            <div className="row justify-content-between align-items-center g-2 mb-3">
              <div className="col-sm-6">
                <h4 className="d-flex align-items-center text-capitalize gap-10 mb-0">
                  <img width={20} className="mb-1" src="https://6valley.6amtech.com/public/assets/back-end/img/admin-wallet.png" alt="" />
                  Vendor Wallet
                </h4>
              </div>
            </div>
            <div className="row g-2" id="order_stats">
              <div className="col-lg-4">
                <div className="card h-100 d-flex justify-content-center align-items-center">
                  <div className="card-body d-flex flex-column gap-10 align-items-center justify-content-center">
                    <img width={48} className="mb-2" src="https://6valley.6amtech.com/public/assets/back-end/img/withdraw.png" alt="" />
                    <h3 className="for-card-count mb-0 fz-24">$9,590.01</h3>
                    <div className="font-weight-bold text-capitalize mb-30">
                      Withdrawable balance
                    </div>
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
                          <div className="text-capitalize mb-0">Pending Withdraw</div>
                        </div>
                        <div>
                          <img width={40} className="mb-2" src="https://6valley.6amtech.com/public/assets/back-end/img/pw.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card card-body h-100 justify-content-center">
                      <div className="d-flex gap-2 justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-start">
                          <h3 className="mb-1 fz-24">$1,827.00</h3>
                          <div className="text-capitalize mb-0">Total Commission given</div>
                        </div>
                        <div>
                          <img width={40} src="https://6valley.6amtech.com/public/assets/back-end/img/tcg.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card card-body h-100 justify-content-center">
                      <div className="d-flex gap-2 justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-start">
                          <h3 className="mb-1 fz-24">$1,000.00</h3>
                          <div className="text-capitalize mb-0">Aready Withdrawn</div>
                        </div>
                        <div>
                          <img width={40} src="https://6valley.6amtech.com/public/assets/back-end/img/aw.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card card-body h-100 justify-content-center">
                      <div className="d-flex gap-2 justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-start">
                          <h3 className="mb-1 fz-24">$0.00</h3>
                          <div className="text-capitalize mb-0">Total delivery charge earned</div>
                        </div>
                        <div>
                          <img width={40} src="https://6valley.6amtech.com/public/assets/back-end/img/tdce.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card card-body h-100 justify-content-center">
                      <div className="d-flex gap-2 justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-start">
                          <h3 className="mb-1 fz-24">$730.00</h3>
                          <div className="text-capitalize mb-0">Total tax given</div>
                        </div>
                        <div>
                          <img width={40} src="https://6valley.6amtech.com/public/assets/back-end/img/ttg.png" alt="" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card card-body h-100 justify-content-center">
                      <div className="d-flex gap-2 justify-content-between align-items-center">
                        <div className="d-flex flex-column align-items-start">
                          <h3 className="mb-1 fz-24">$0.00</h3>
                          <div className="text-capitalize mb-0">Collected cash</div>
                        </div>
                        <div>
                          <img width={40} src="https://6valley.6amtech.com/public/assets/back-end/img/cc.png" alt="" />
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
      </div>

      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default Sellerdetails;
