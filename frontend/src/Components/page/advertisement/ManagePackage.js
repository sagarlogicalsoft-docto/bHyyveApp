import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./managePackage.css";

const ManagePackage = () => {
  const navigate = useNavigate();

  // =========================================================
  // TEMPORARY PACKAGE DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [packageData, setPackageData] = useState([
    {
      id: 1,
      packageName: "Videography package",
      description:
        "Professional videography of your business in action!",
      price: 299,
      validityDays: 7,
    },
    {
      id: 2,
      packageName: "Professional branding",
      description:
        "Brand kit, 10 t-shirts, 1000 brochures, 1000 flyers, 500 business cards",
      price: 379,
      validityDays: 14,
    },
    {
      id: 3,
      packageName:
        "Professional Website with marketing content + domain + deployment",
      description:
        "bHyyve Technologies will build you a professional, modern website and deploy it on a custom web domain for your business. We will generate all images, custom brand code and videos. One-time fee with no reoccurring costs. APIs and 3rd party purchases extra.",
      price: 499,
      validityDays: 365,
    },
  ]);

  // =========================================================
  // SELECTED PACKAGES
  // =========================================================

  const [selectedPackages, setSelectedPackages] = useState([]);

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedPackages(packageData.map((item) => item.id));
    } else {
      setSelectedPackages([]);
    }
  };

  // =========================================================
  // SELECT SINGLE PACKAGE
  // =========================================================

  const handleSelectPackage = (id) => {
    setSelectedPackages((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id],
    );
  };

  // =========================================================
  // EDIT PACKAGE
  // =========================================================

  const handleEdit = (row) => {
    console.log("Edit Package:", row);

    // API / EDIT ROUTE CAN BE CONNECTED HERE LATER
    navigate(`/edit-package/${row.id}`);
  };

  // =========================================================
  // DELETE PACKAGE
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.packageName}"?`,
    );

    if (!confirmed) return;

    setPackageData((previous) =>
      previous.filter((item) => item.id !== row.id),
    );

    setSelectedPackages((previous) =>
      previous.filter((itemId) => itemId !== row.id),
    );

    console.log("Delete Package:", row);

    // API DELETE CALL WILL BE CONNECTED HERE LATER
  };

  // =========================================================
  // DELETE SELECTED PACKAGES
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedPackages.length === 0) {
      alert("Please select at least one package.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPackages.length} selected package(s)?`,
    );

    if (!confirmed) return;

    setPackageData((previous) =>
      previous.filter(
        (item) => !selectedPackages.includes(item.id),
      ),
    );

    setSelectedPackages([]);

    console.log("Delete Selected Packages:", selectedPackages);

    // API DELETE CALL WILL BE CONNECTED HERE LATER
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="manage-package-select-header">
            <input
              type="checkbox"
              className="manage-package-checkbox"
              checked={
                packageData.length > 0 &&
                selectedPackages.length === packageData.length
              }
              onChange={handleSelectAll}
            />

            <span>All</span>
            <span>Select</span>
          </div>
        ),
        width: "125px",
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="manage-package-checkbox"
            checked={selectedPackages.includes(row.id)}
            onChange={() => handleSelectPackage(row.id)}
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.no",
        width: "90px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "packageName",
        label: "Package Name",
        width: "240px",
        sortable: true,

        render: (value) => (
          <div className="manage-package-name">
            {value}
          </div>
        ),
      },

      {
        key: "description",
        label: "Desc",
        width: "500px",
        sortable: true,

        render: (value) => (
          <div className="manage-package-description">
            {value}
          </div>
        ),
      },

      {
        key: "price",
        label: (
          <span className="manage-package-price-heading">
            Price
            <br />
            (Rs.)
          </span>
        ),
        width: "120px",
        sortable: true,

        render: (value) => (
          <span className="manage-package-price">
            {Number(value).toFixed(0)}
          </span>
        ),
      },

      {
        key: "validityDays",
        label: (
          <span className="manage-package-validity-heading">
            Validity
            <br />
            Days
          </span>
        ),
        width: "140px",
        sortable: true,

        render: (value) => (
          <span className="manage-package-validity">
            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        width: "135px",
        sortable: false,

        render: (_, row) => (
          <div className="manage-package-actions">

            <button
              type="button"
              className="manage-package-btn manage-package-edit-btn"
              onClick={() => handleEdit(row)}
            >
              Edit
            </button>

            <button
              type="button"
              className="manage-package-btn manage-package-delete-btn"
              onClick={() => handleDelete(row)}
            >
              Delete
            </button>

          </div>
        ),
      },
    ],
    [packageData, selectedPackages],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="manage-package-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="manage-package-header">

        <h2 className="manage-package-title">
          All Packages List
        </h2>

        <div className="manage-package-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="manage-package-breadcrumb-active">
            All Packages
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="manage-package-card">

        <div className="manage-package-table-wrapper">

          <DataTable
            columns={columns}
            data={packageData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

        {/* ===================================================
            BOTTOM DELETE BUTTON
        =================================================== */}

        {selectedPackages.length > 0 && (
          <div className="manage-package-bottom-actions">

            <button
              type="button"
              className="manage-package-bottom-delete"
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedPackages.length})
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default ManagePackage;