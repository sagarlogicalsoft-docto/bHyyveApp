import React, { useEffect, useState } from "react";
import Header from "../Header";
import "../sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { MotionAnimate } from "react-motion-animate";
import App from "../../App";
import swal from "sweetalert";
import Sidebarr from "../Sidebar";

const Allproducts = () => {
  let navigate = useNavigate();
  let deleteproducts = () => {
    swal({
      title: "Are you sure?",
      text: "Are you sure that you want to delete this banner?",
      icon: "success",
      dangerMode: true,
    });
  };

  let addproducts = () => {
    navigate("/addnewproducts");
  };

  return (
    <div>
    {/* <Header /> */}
    <div
      className="container row" style={{ paddingLeft: "0px", paddingRight: "0px", marginLeft: "0px" }}
      
    >
      <div className="col-lg-3 col-md-4" >
        {/* <Sidebarr /> */}
      </div>

      <div
        className="col-lg-9 col-md-8"
        style={{  marginTop: "60px" }}
      >
         <div className="mt-3 mb-5">
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <h2 className="h1 mb-0">
                <img
                  src="https://6valley.6amtech.com/public/assets/back-end/img/all-orders.png"
                  className="mb-1 mr-1"
                  alt
                />
                <span className="page-header-title">All</span>
                Orders
              </h2>
              <span className="badge badge-soft-dark radius-50 fz-14">23</span>
            </div>
            <div className="card mb-3">
              <div className="card-body">
                <form
                  action="https://6valley.6amtech.com/seller/orders/list/all"
                  id="form-data"
                  method="GET"
                >
                  <div className="row gx-2">
                    <div className="col-12">
                      <h4 className="mb-3 text-capitalize">Filter order</h4>
                    </div>
                    <div className="col-sm-6 col-lg-4 col-xl-3">
                      <div className="form-group">
                        <label className="title-color" htmlFor="filter">
                          Order Type
                        </label>
                        <select
                          name="filter"
                          id="filter"
                          className="form-control select2-selection__arrow"
                        >
                          <option value="all">All</option>
                          <option value="inhouse">Website Order</option>
                          <option value="POS">POS Order</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4 col-xl-3">
                      <div className="form-group">
                        <label className="title-color" htmlFor="customer">
                          Customer
                        </label>
                        <input
                          type="hidden"
                          id="customer_id"
                          name="customer_id"
                          defaultValue="all"
                        />
                        <select
                          onchange="customer_id_value(this.value)"
                          data-placeholder="                                                    All customer
                                                "
                          className="js-data-example-ajax form-control form-ellipsis"
                        >
                          <option value="all">All customer</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4 col-xl-3">
                      <label className="title-color" htmlFor="date_type">
                        Date type
                      </label>
                      <div className="form-group">
                        <select
                          className="form-control __form-control"
                          name="date_type"
                          id="date_type"
                        >
                          <option value="this_year" selected>
                            This Year
                          </option>
                          <option value="this_month">This Month</option>
                          <option value="this_week">This Week</option>
                          <option value="custom_date">Custom Date</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4 col-xl-3" id="from_div">
                      <label className="title-color" htmlFor="customer">
                        Start date
                      </label>
                      <div className="form-group">
                        <input
                          type="date"
                          name="from"
                          defaultValue
                          id="from_date"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-4 col-xl-3" id="to_div">
                      <label className="title-color" htmlFor="customer">
                        End date
                      </label>
                      <div className="form-group">
                        <input
                          type="date"
                          defaultValue
                          name="to"
                          id="to_date"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="d-flex gap-3 justify-content-end">
                        <a
                          href="https://6valley.6amtech.com/seller/orders/list/all"
                          className="btn btn-secondary px-5"
                        >
                          Reset
                        </a>
                        <button
                          type="submit"
                          className="btn btn--primary px-5"
                          onclick="formUrlChange(this)"
                          data-action="https://6valley.6amtech.com/seller/orders/list/all"
                        >
                          Show data
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="px-3 py-4 light-bg">
                  <div className="row g-2 align-items-center flex-grow-1">
                    <div className="col-md-4">
                      <h5 className="text-capitalize d-flex gap-1">
                        Order list
                        <span className="badge badge-soft-dark radius-50 fz-12">
                          23
                        </span>
                      </h5>
                    </div>
                    <div className="col-md-8 d-flex gap-3 flex-wrap flex-sm-nowrap justify-content-md-end">
                      <form
                        action="https://6valley.6amtech.com/seller/orders/list/all"
                        method="GET"
                      >
                        <div className="input-group input-group-merge input-group-custom">
                          <input
                            id="datatableSearch_"
                            type="search"
                            name="search"
                            className="form-control"
                            placeholder="Search orders"
                            aria-label="Search orders"
                          />
                          <button type="submit" className="btn btn--primary">
                            Search
                          </button>
                        </div>
                      </form>
                      <div className="dropdown">
                        <button
                          onClick={addproducts}
                          type="submit"
                          className="btn btn--primary"
                        >
                          Add New Products
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="table-responsive">
                  <table
                    id="datatable"
                    style={{ textAlign: "left" }}
                    className="table table-hover table-borderless table-thead-bordered table-nowrap table-align-middle card-table"
                  >
                    <thead className="thead-light thead-50 text-capitalize">
                      <tr>
                        <th className="text-capitalize">SL</th>
                        <th className="text-capitalize">Order ID</th>
                        <th className="text-capitalize">Order Date</th>
                        <th className="text-capitalize">Customer info</th>
                        <th className="text-capitalize">Total amount</th>
                        <th className="text-capitalize">Order Status </th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>1</td>
                        <td>
                          <Link
                            className="title-color hover-c1"
                            to="/orderdetails"
                          >
                            100181{" "}
                          </Link>
                        </td>
                        <td>
                          <div>10 Jan 2023</div>
                          <div>02:56 AM</div>
                        </td>
                        <td>
                          <div>Jocky Lop</div>
                          <a
                            className="d-block title-color"
                            href="tel:+88012345678"
                          >
                            +88012345678
                          </a>
                        </td>
                        <td>
                          <div>$380.00</div>
                          <span className="badge badge-soft-success">Paid</span>
                        </td>
                        <td className="text-capitalize ">
                          <label className="badge badge-soft-success">
                            delivered
                          </label>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link
                              className="btn btn-outline--primary btn-sm square-btn"
                              title="View"
                              to="/orderdetails"
                            >
                              <i className="fa fa-eye" aria-hidden="true" />
                            </Link>
                            <s
                              onClick={deleteproducts}
                              className="btn btn-outline-danger btn-sm square-btn"
                              href="javascript:"
                              title="Delete"
                              onclick="form_alert('product-36','Want to delete this item ')"
                            >
                              <i className="fa fa-trash-o" aria-hidden="true" />
                            </s>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* <MotionAnimate> */}
                  {/* <div>Component you want to animate</div> */}
                  {/* </MotionAnimate> */}
                </div>
                <div className="table-responsive mt-4">
                  <div className="d-flex justify-content-lg-end"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Allproducts;
