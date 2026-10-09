import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSave,
  FaSyncAlt,
} from "react-icons/fa";

import "./createEstimate.css";

const CreateEstimate = () => {
  const navigate = useNavigate();

  // =========================================================
  // ESTIMATE NUMBER
  // =========================================================

  const generateEstimateNumber = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `EST-${year}${month}${day}${hours}${minutes}${seconds}0003`;
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const getExpiryDate = () => {
    const date = new Date();

    date.setDate(date.getDate() + 30);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================================================
  // FORM STATE
  // =========================================================

  const [formData, setFormData] = useState({
    estimateNumber: generateEstimateNumber(),
    estimateDate: getToday(),
    expiryDate: getExpiryDate(),

    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",

    tax: 0,

    notes: "",
    terms: "",
  });

  // =========================================================
  // SERVICES
  // =========================================================

  const [items, setItems] = useState([
    {
      id: Date.now(),
      service: "",
      description: "",
      quantity: 1,
      unitPrice: "",
    },
  ]);

  // =========================================================
  // SAMPLE SERVICES
  // Later API data will come here
  // =========================================================

  const services = [
    {
      id: 1,
      name: "House Cleaning",
      description: "Professional house cleaning service",
      price: 120,
    },
    {
      id: 2,
      name: "Deep Cleaning",
      description: "Complete deep cleaning service",
      price: 250,
    },
    {
      id: 3,
      name: "Car Detailing",
      description: "Premium car detailing service",
      price: 180,
    },
    {
      id: 4,
      name: "Snow Removal",
      description: "Snow removal service",
      price: 100,
    },
    {
      id: 5,
      name: "Photography",
      description: "Professional photography service",
      price: 300,
    },
  ];

  // =========================================================
  // INPUT CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // ITEM CHANGE
  // =========================================================

  const handleItemChange = (id, field, value) => {
    setItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const updatedItem = {
          ...item,
          [field]: value,
        };

        // -----------------------------------------------------
        // AUTO FILL SERVICE DATA
        // -----------------------------------------------------

        if (field === "service") {
          const selectedService = services.find(
            (service) => service.id.toString() === value
          );

          if (selectedService) {
            updatedItem.description = selectedService.description;
            updatedItem.unitPrice = selectedService.price;
          } else {
            updatedItem.description = "";
            updatedItem.unitPrice = "";
          }
        }

        return updatedItem;
      })
    );
  };

  // =========================================================
  // ADD ITEM
  // =========================================================

  const handleAddItem = () => {
    setItems((previous) => [
      ...previous,
      {
        id: Date.now(),
        service: "",
        description: "",
        quantity: 1,
        unitPrice: "",
      },
    ]);
  };

  // =========================================================
  // DELETE ITEM
  // =========================================================

  const handleDeleteItem = (id) => {
    if (items.length === 1) {
      return;
    }

    setItems((previous) => previous.filter((item) => item.id !== id));
  };

  // =========================================================
  // ITEM TOTAL
  // =========================================================

  const getItemTotal = (item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;

    return quantity * unitPrice;
  };

  // =========================================================
  // SUBTOTAL
  // =========================================================

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return total + getItemTotal(item);
    }, 0);
  }, [items]);

  // =========================================================
  // TAX
  // =========================================================

  const taxAmount = useMemo(() => {
    const taxPercentage = Number(formData.tax) || 0;

    return (subtotal * taxPercentage) / 100;
  }, [subtotal, formData.tax]);

  // =========================================================
  // FINAL TOTAL
  // =========================================================

  const total = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setFormData({
      estimateNumber: generateEstimateNumber(),
      estimateDate: getToday(),
      expiryDate: getExpiryDate(),

      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",

      tax: 0,

      notes: "",
      terms: "",
    });

    setItems([
      {
        id: Date.now(),
        service: "",
        description: "",
        quantity: 1,
        unitPrice: "",
      },
    ]);
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    const estimateData = {
      ...formData,
      items,
      subtotal,
      taxAmount,
      total,
    };

    console.log("Estimate Data:", estimateData);

    // API call will come here later

    alert("Estimate saved successfully.");
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBack = () => {
    navigate("/estimates");
  };

  return (
    <div className="create-estimate-page">
      <div className="create-estimate-card">
        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="create-estimate-header">
          <h2>Create New Estimate</h2>

          <button
            type="button"
            className="create-estimate-back-btn"
            onClick={handleBack}
          >
            <FaArrowLeft />
            Back to Estimates
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* =====================================================
              ESTIMATE INFORMATION
          ===================================================== */}

          <div className="estimate-info-grid">
            <div className="estimate-form-group">
              <label>
                Estimate Number <span>*</span>
              </label>

              <input
                type="text"
                name="estimateNumber"
                value={formData.estimateNumber}
                onChange={handleChange}
              />
            </div>

            <div className="estimate-form-group">
              <label>
                Estimate Date <span>*</span>
              </label>

              <input
                type="date"
                name="estimateDate"
                value={formData.estimateDate}
                onChange={handleChange}
              />
            </div>

            <div className="estimate-form-group">
              <label>Expiry Date</label>

              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* =====================================================
              CLIENT INFORMATION
          ===================================================== */}

          <div className="estimate-section">
            <h3>Client Information</h3>

            <div className="estimate-section-line"></div>

            <div className="client-info-grid">
              <div className="estimate-form-group">
                <label>
                  Client Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                />
              </div>

              <div className="estimate-form-group">
                <label>
                  Client Email <span>*</span>
                </label>

                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                />
              </div>

              <div className="estimate-form-group">
                <label>Client Phone</label>

                <input
                  type="text"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="estimate-form-group">
                <label>Client Address</label>

                <textarea
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* =====================================================
              SERVICES / ITEMS
          ===================================================== */}

          <div className="estimate-section services-section">
            <h3>Services/Items</h3>

            <div className="estimate-section-line"></div>

            <div className="estimate-items-wrapper">
              <table className="estimate-items-table">
                <thead>
                  <tr>
                    <th className="estimate-service-col">
                      Service
                    </th>

                    <th className="estimate-description-col">
                      Description
                    </th>

                    <th className="estimate-quantity-col">
                      Quantity
                    </th>

                    <th className="estimate-unit-price-col">
                      Unit Price
                    </th>

                    <th className="estimate-total-col">
                      Total
                    </th>

                    <th className="estimate-delete-col"></th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <select
                          value={item.service}
                          onChange={(event) =>
                            handleItemChange(
                              item.id,
                              "service",
                              event.target.value
                            )
                          }
                        >
                          <option value="">Select Service</option>

                          {services.map((service) => (
                            <option
                              key={service.id}
                              value={service.id}
                            >
                              {service.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <textarea
                          value={item.description}
                          placeholder="Enter description or it will auto-fill from service"
                          onChange={(event) =>
                            handleItemChange(
                              item.id,
                              "description",
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(
                              item.id,
                              "quantity",
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) =>
                            handleItemChange(
                              item.id,
                              "unitPrice",
                              event.target.value
                            )
                          }
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={getItemTotal(item).toFixed(2)}
                          readOnly
                          className="estimate-item-total"
                        />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="estimate-delete-btn"
                          onClick={() =>
                            handleDeleteItem(item.id)
                          }
                          disabled={items.length === 1}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* ADD ITEM */}

                  <tr className="estimate-add-item-row">
                    <td colSpan="6">
                      <button
                        type="button"
                        className="estimate-add-item-btn"
                        onClick={handleAddItem}
                      >
                        <FaPlus />
                        Add Item
                      </button>
                    </td>
                  </tr>

                  {/* SUBTOTAL */}

                  <tr className="estimate-summary-row">
                    <td colSpan="4"></td>

                    <td className="estimate-summary-label">
                      Subtotal:
                    </td>

                    <td>
                      <input
                        type="text"
                        value={subtotal.toFixed(2)}
                        readOnly
                        className="estimate-summary-input"
                      />
                    </td>
                  </tr>

                  {/* TAX */}

                  <tr className="estimate-summary-row">
                    <td colSpan="4"></td>

                    <td className="estimate-summary-label">
                      Tax (%):
                    </td>

                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="tax"
                        value={formData.tax}
                        onChange={handleChange}
                        className="estimate-tax-input"
                      />
                    </td>
                  </tr>

                  {/* TOTAL */}

                  <tr className="estimate-summary-row estimate-final-row">
                    <td colSpan="4"></td>

                    <td className="estimate-summary-label">
                      Total:
                    </td>

                    <td>
                      <input
                        type="text"
                        value={total.toFixed(2)}
                        readOnly
                        className="estimate-summary-input"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* =====================================================
              NOTES
          ===================================================== */}

          <div className="estimate-bottom-field">
            <label>Notes</label>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* =====================================================
              TERMS & CONDITIONS
          ===================================================== */}

          <div className="estimate-bottom-field">
            <label>Terms & Conditions</label>

            <textarea
              name="terms"
              value={formData.terms}
              onChange={handleChange}
            />
          </div>

          {/* =====================================================
              FORM BUTTONS
          ===================================================== */}

          <div className="estimate-form-actions">
            <button
              type="submit"
              className="estimate-save-btn"
            >
              <FaSave />
              Save Estimate
            </button>

            <button
              type="button"
              className="estimate-reset-btn"
              onClick={handleReset}
            >
              <FaSyncAlt />
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEstimate;