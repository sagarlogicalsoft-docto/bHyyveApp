import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";

import DataTable from "../../common/DataTable";

import "./allServices.css";

const AllServices = () => {
  const navigate = useNavigate();

  const [serviceData, setServiceData] = useState([
    {
      id: 1,
      serviceName:
        "Listing Showcase: Cinematic video, drone, floor plan and agent presentation",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100",
      rate: "549",
      category: "Photography & Videography",
      vendorName: "Listing Lens Co.",
    },
    {
      id: 2,
      serviceName:
        "Listing Complete: Photography, drone coverage and floor plan",
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=100",
      rate: "249",
      category: "Photography & Videography",
      vendorName: "Listing Lens Co.",
    },
    {
      id: 3,
      serviceName: "Listing Essentials: Professional property photography",
      image:
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=100",
      rate: "149",
      category: "Photography & Videography",
      vendorName: "Listing Lens Co.",
    },
    {
      id: 4,
      serviceName: "Hazelnut and Walnut Brownies (Dozen)",
      image:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=100",
      rate: "18",
      category: "Wholesale & Distribution",
      vendorName: "Oven to Market Co.",
    },
  ]);

  const handleAdd = () => {
    navigate("/services/add");
  };

  const handleEdit = (id) => {
    navigate(`/services/edit/${id}`);
  };

  const handleVendorDetail = (id) => {
    navigate(`/services/vendor/${id}`);
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?",
    );

    if (!confirmed) return;

    setServiceData((previous) =>
      previous.filter((service) => service.id !== id),
    );

    console.log("Delete Service:", id);

    // API call later
  };

  const columns = useMemo(
    () => [
      {
        key: "serial",
        label: "Sr.No",
        width: "100px",
        sortable: false,
        render: (_, row, rowIndex) => rowIndex + 1,
      },

      {
        key: "serviceName",
        label: "Service Name",
        width: "300px",
        sortable: true,

        render: (value) => <div className="all-services-name">{value}</div>,
      },

      {
        key: "image",
        label: "Image",
        width: "120px",
        sortable: false,
        render: (value) => (
          <div className="all-services-image-wrapper">
            <img src={value} alt="Service" />
          </div>
        ),
      },

      {
        key: "rate",
        label: "Rate",
        width: "100px",
        sortable: true,
      },

      {
        key: "category",
        label: "Category",
        width: "220px",
        sortable: true,
      },

      {
        key: "vendorName",
        label: "Vendor Name",
        width: "210px",
        sortable: true,
      },

      {
        key: "action",
        label: "Action",
        width: "150px",
        sortable: false,

        render: (_, row) => (
          <div className="all-services-actions">
            <button
              type="button"
              className="all-services-edit-btn"
              onClick={() => handleEdit(row.id)}
            >
              <FaEdit />
              Edit
            </button>

            <button
              type="button"
              className="all-services-vendor-btn"
              onClick={() => handleVendorDetail(row.id)}
            >
              <FaEye />
              Vendor Detail
            </button>

            <button
              type="button"
              className="all-services-delete-btn"
              onClick={() => handleDelete(row.id)}
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="all-services-page">
      {/* PAGE HEADER */}

      <div className="all-services-page-header">
        <div>
          <h2 className="all-services-page-title">All Services</h2>

          <div className="all-services-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="all-services-breadcrumb-active">All Services</span>
          </div>
        </div>
      </div>

      {/* MAIN CARD */}

      <div className="all-services-card">
        {/* CARD HEADER */}

        <div className="all-services-card-header">
          <h3>All Services</h3>

          {/* ADD BUTTON INSIDE CARD - RIGHT SIDE */}

          <button
            type="button"
            className="all-services-add-btn"
            onClick={handleAdd}
          >
            Add Service
          </button>
        </div>

        {/* TABLE */}

        <div className="all-services-table-wrapper">
          <DataTable
            columns={columns}
            data={serviceData}
            entriesPerPageOptions={[5, 10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />
        </div>
      </div>
    </div>
  );
};

export default AllServices;
