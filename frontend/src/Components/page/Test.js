import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Sidebarr from "../Sidebar";
import { useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

const ChartComponent = () => {
  const navigate = useNavigate();

  const [checkedValues, setCheckedValues] = useState([]);
  const [restriction, setRestriction] = useState({});
  let iddd = secureLocalStorage.getItem("driveriddss");
  useEffect(() => {
    const apiResponse = secureLocalStorage.getItem("restr");

    if (apiResponse) {
      setRestriction(apiResponse);
      setCheckedValues(getCheckedValuesFromRestrictions(apiResponse));
    }
  }, []);

  const getCheckedValuesFromRestrictions = (restrictions) => {
    let checked = [];
    Object.keys(restrictions).forEach((key) => {
      if (restrictions[key].length > 0) {
        checked.push(key.toUpperCase().replace(/_/g, " "));
      }
    });
    return checked;
  };

  const handleCheckboxChange = (value) => {
    if (checkedValues.includes(value)) {
      setCheckedValues(checkedValues.filter((item) => item !== value));
    } else {
      setCheckedValues([...checkedValues, value]);
    }
  };

  const generateRestrictionsObject = (checkedValues) => {
    const restrictions = {};

    const restrictionsMapping = {
      CUSTOMERS: ["/Customer List", "/Customer Reviews", "/Loyalty Points"],
      VENDORS: ["/Add New Vendor", "/Vendor List", "/Vendor Withdrow"],
      "DELIVERY MEN": [
        "/Add New Deliveryman",
        "/Delivery Man List",
        "/Delivery Man Withdrow",
        "/Emergency Contact",
      ],
      CATEGORY: [
        "/Main Cetagory",
        "/Cetagory",
        "/Subcategory",
        "/Sub Subcetagory",
      ],
      "PRODUCT ATTRIBUTE": ["/Brands", "/Product Type"],
      "ADD ATTRIBUTE": ["/Add Attribute"],
      "VENDOR PRODUCTS": [
        "/New Products Requests",
        "/Approved Products",
        "/Denied Products",
      ],
      ORDER: [
        "/Pending",
        "/Confirmed",
        "/Packing",
        "/Shipped",
        "/Delivered",
        "/Returned",
        "/Not delivered",
        "/Cancelled",
      ],
      REFUND: [
        "/Pending Refund",
        "/Approved Refund",
        "/Refunded Refund",
        "/Rejected Refund",
      ],
      BANNERS: ["/Banners"],
      "ADVERTISEMENT & DEALS": [
        "/Add Advertisement",
        "/Deal of the day",
        "/Today Offer",
      ],
      NOTIFICATION: ["/Send Notification"],
      SUGGESTION: ["/Suggestion"],
      MESSAGES: ["/Messages"],
      "ALL TRANSACTION": ["/All Transaction"],
      SETTING: [
        "/Tax & Fare charge",
        "/About Us",
        "/Term & Conditions",
        "/Return Policy",
        "/Cancellation Policy",
        "/Refund Policy",
        "/Privacy & Policy",
        "/Faq",
        "/Contact Us",
      ],
    };

    checkedValues.forEach((key) => {
      const formattedKey = key.toLowerCase().replace(/ /g, "_");
      if (restrictionsMapping[key]) {
        restrictions[formattedKey] = restrictionsMapping[key];
      }
    });

    return restrictions;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedRestrictions = generateRestrictionsObject(checkedValues);

    const formData = {
      staffId: iddd,
      first_name: "staff",
      last_name: "new",
      password: "12345678",
      email: "a1@gmail.com",
      restrictions: JSON.stringify(updatedRestrictions),
    };

    axios
      .post(`${process.env.REACT_APP_API_KEY}admin/api/update_staffs`, formData)
      .then((res) => {
        toast.success(res.data.message);
        setTimeout(()=>{
          navigate("/Satff List")
        },3000)
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          toast.error(error.response.data.message);
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      });
  };

  const checkboxOptions = [
    { label: "CUSTOMERS", value: "CUSTOMERS" },
    { label: "VENDORS", value: "VENDORS" },
    { label: "DELIVERY MEN", value: "DELIVERY MEN" },
    { label: "CATEGORY", value: "CATEGORY" },
    { label: "PRODUCT ATTRIBUTE", value: "PRODUCT ATTRIBUTE" },
    { label: "ADD ATTRIBUTE", value: "ADD ATTRIBUTE" },
    { label: "VENDOR PRODUCTS", value: "VENDOR PRODUCTS" },
    { label: "ORDER", value: "ORDER" },
    { label: "REFUND REQUEST LIST", value: "REFUND REQUEST LIST" },
    { label: "BANNERS", value: "BANNERS" },
    { label: "ADVERTISEMENT & DEALS", value: "ADVERTISEMENT & DEALS" },
    { label: "NOTIFICATION", value: "NOTIFICATION" },
    { label: "SUGGESTION", value: "SUGGESTION" },
    { label: "MESSAGES", value: "MESSAGES" },
    { label: "ALL TRANSACTION", value: "ALL TRANSACTION" },
    { label: "SETTING", value: "SETTING" },
  ];

  return (
    <div>
      <Toaster />
      <div
        className="container row"
        style={{ paddingLeft: "0px", paddingRight: "0px", marginLeft: "0px" }}
      >
        <div className="col-lg-3 col-md-4">
          <Sidebarr />
        </div>
        <div className="col-lg-9 col-md-8" style={{ marginTop: "60px" }}>
          <div className="mt-3 mb-5">
            <div className="mb-3 d-flex justify-content-between flex-wrap gap-3">
              <h2 className="h1 mb-0 text-capitalize d-flex align-items-center gap-2">
                <img
                  width={20}
                  src="https://6valley.6amtech.com/public/assets/back-end/img/admin-wallet.png"
                  alt=""
                />
                Add New Staff
              </h2>
              <button
                onClick={() => navigate("/Staff List")}
                type="button"
                className="btn btn--primary text-capitalize"
              >
                Staff List
              </button>
            </div>
            <div className="card mt-3">
              <div className="card-header text-capitalize">
                <h4 className="mb-0">Staff Details</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-12 pt-3">
                    <form onSubmit={handleSubmit}>
                      <div className="card">
                        <div className="card-body">
                          <h5 className="mb-0 page-header-title text-capitalize d-flex align-items-center gap-2 border-bottom pb-3 mb-3">
                            <i className="fa fa-user" aria-hidden="true"></i>
                            Personal information
                          </h5>
                          <div className="row">
                            <div className="col-md-6 col-lg-6 col-sm-12">
                              <label className="title-color">
                                Restrictions: {checkedValues.join(", ")}
                              </label>
                              <div className="form-group mb-0">
                                {checkboxOptions.map((option, index) => (
                                  <div
                                    key={index}
                                    className="border rounded px-2 py-3 d-flex justify-content-between mb-1"
                                  >
                                    <h5 className="mb-1 d-flex gap-1 c1">
                                      {option.label}
                                    </h5>
                                    <div className="position-relative">
                                      <label className="switcher">
                                        <input
                                          type="checkbox"
                                          className="switcher_input toggle-switch-message"
                                          name={option.value}
                                          checked={checkedValues.includes(
                                            option.label
                                          )}
                                          onChange={() =>
                                            handleCheckboxChange(option.label)
                                          }
                                        />
                                        <span className="switcher_control"></span>
                                      </label>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-end gap-3 mt-3">
                            <button
                              type="submit"
                              className="btn btn--primary px-4"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartComponent;
