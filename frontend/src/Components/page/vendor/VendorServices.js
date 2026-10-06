import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";

import DataTable from "../../common/DataTable";
import "./vendorServices.css";

const VendorServices = () => {
  const navigate = useNavigate();

  const [services, setServices] = useState([
    {
      id: 1,
      serviceName: "Listing Showcase",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=150&q=80",
      rate: 450,
      category: "Photography & Videography",
      vendorName: "Virtual Home Photography",
    },
    {
      id: 2,
      serviceName: "Listing Pro",
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=150&q=80",
      rate: 275,
      category: "Photography & Videography",
      vendorName: "Virtual Home Photography",
    },
    {
      id: 3,
      serviceName: "HD Photos",
      image:
        "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=150&q=80",
      rate: 175,
      category: "Photography & Videography",
      vendorName: "Virtual Home Photography",
    },
  ]);

  /* =========================================
     DELETE SERVICE
  ========================================= */

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmDelete) return;

    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  /* =========================================
     EDIT SERVICE
  ========================================= */

  const handleEdit = (service) => {
    // Change this route according to your Add/Edit Service route.
    navigate(`/services/edit/${service.id}`, {
      state: { service },
    });
  };

  /* =========================================
     VIEW VENDOR
  ========================================= */

  const handleVendorDetail = (service) => {
    // Change the route if your Vendor Details route is different.
    navigate(`/vendor/view/${service.id}`, {
      state: {
        vendorName: service.vendorName,
        service: service,
      },
    });
  };

  /* =========================================
     TABLE COLUMNS
  ========================================= */

  const columns = [
      {
        key: "serial",
        label: "Sr.No",
        sortable: true,
        width: "85px",
      },

      {
        key: "serviceName",
        label: "Service Name",
        sortable: true,
        render: (_, row) => (
          <div className="vendor-service-name">
            {row.serviceName}
          </div>
        ),
        width: "175px",
      },

      {
        key: "image",
        label: "Image",
        sortable: false,
        render: (_, row) => (
          <img
            src={row.image}
            alt={row.serviceName}
            className="vendor-service-image"
          />
        ),
        width: "105px",
      },

      {
        key: "rate",
        label: "Rate",
        sortable: true,
        render: (_, row) => (
          <span className="vendor-service-rate">
            {row.rate}
          </span>
        ),
        width: "95px",
      },

      {
        key: "category",
        label: "Category",
        sortable: true,
        render: (_, row) => (
          <div className="vendor-service-category">
            {row.category}
          </div>
        ),
        width: "200px",
      },

      {
        key: "vendorName",
        label: "Vendor Name",
        sortable: true,
        render: (_, row) => (
          <div className="vendor-service-vendor">
            {row.vendorName}
          </div>
        ),
        width: "220px",
      },

      {
        key: "id",
        label: "Action",
        sortable: false,
        render: (_, row) => (
          <div className="vendor-service-actions">
            <button
              type="button"
              className="vendor-service-btn vendor-service-edit"
              onClick={() => handleEdit(row)}
              title="Edit"
            >
              <FaEdit />
              <span>Edit</span>
            </button>

            <button
              type="button"
              className="vendor-service-btn vendor-service-detail"
              onClick={() => handleVendorDetail(row)}
              title="Vendor Detail"
            >
              <FaEye />
              <span>Vendor Detail</span>
            </button>

            <button
              type="button"
              className="vendor-service-btn vendor-service-delete"
              onClick={() => handleDelete(row.id)}
              title="Delete"
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        ),
        width: "245px",
      },
  ];

  return (
    <div className="vendor-services-page">

      {/* =========================================
          PAGE CARD
      ========================================= */}

      <div className="vendor-services-card">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="vendor-services-header">

          <h2 className="vendor-services-title">
            All Services
          </h2>

          <Link
            to="/services/add"
            className="vendor-services-add-btn"
          >
            <FaPlus />
            <span>Add</span>
          </Link>

        </div>

        {/* =========================================
            DATATABLE
        ========================================= */}

        <div className="vendor-services-table-wrapper">

          <DataTable
            columns={columns}
            data={services}
            entriesPerPageOptions={[10, 25, 50, 100]}
            searchable={true}
            sortable={true}
          />

        </div>

      </div>
    </div>
  );
};

export default VendorServices;