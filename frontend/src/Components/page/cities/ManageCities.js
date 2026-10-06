import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./manageCities.css";

const ManageCities = () => {
  // =========================================================
  // CITY DATA
  // =========================================================

  const [cities, setCities] = useState([
    {
      id: 1,
      cityName: "Toronto",
    },
    {
      id: 2,
      cityName: "Ottawa",
    },
    {
      id: 3,
      cityName: "Mississauga",
    },
    {
      id: 4,
      cityName: "Brampton",
    },
    {
      id: 5,
      cityName: "Hamilton",
    },
    {
      id: 6,
      cityName: "London",
    },
    {
      id: 7,
      cityName: "Markham",
    },
  ]);

  // =========================================================
  // SELECTED CITIES
  // =========================================================

  const [selectedCities, setSelectedCities] = useState([]);

  // =========================================================
  // EXCEL FILE
  // =========================================================

  const [selectedFile, setSelectedFile] = useState(null);

  // =========================================================
  // SELECT ALL
  // =========================================================

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedCities(cities.map((city) => city.id));
    } else {
      setSelectedCities([]);
    }
  };

  // =========================================================
  // SELECT SINGLE CITY
  // =========================================================

  const handleSelectCity = (id) => {
    setSelectedCities((previous) =>
      previous.includes(id)
        ? previous.filter((cityId) => cityId !== id)
        : [...previous, id]
    );
  };

  // =========================================================
  // FILE SELECT
  // =========================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
  };

  // =========================================================
  // IMPORT EXCEL
  // =========================================================

  const handleImport = () => {
    if (!selectedFile) {
      alert("Please select an Excel file first.");
      return;
    }

    console.log("Import Excel File:", selectedFile);

    // =======================================================
    // EXCEL IMPORT / API LOGIC WILL BE CONNECTED HERE
    // =======================================================

    alert("Excel file selected successfully.");
  };

  // =========================================================
  // EDIT CITY
  // =========================================================

  const handleEdit = (row) => {
    console.log("Edit City:", row);

    // =======================================================
    // EDIT SCREEN / MODAL WILL BE CONNECTED HERE LATER
    // =======================================================
  };

  // =========================================================
  // DELETE SINGLE CITY
  // =========================================================

  const handleDelete = (row) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${row.cityName}"?`
    );

    if (!confirmed) return;

    setCities((previous) =>
      previous.filter((city) => city.id !== row.id)
    );

    setSelectedCities((previous) =>
      previous.filter((cityId) => cityId !== row.id)
    );

    console.log("Delete City:", row);

    // =======================================================
    // API DELETE CALL WILL BE CONNECTED HERE LATER
    // =======================================================
  };

  // =========================================================
  // DELETE SELECTED CITIES
  // =========================================================

  const handleDeleteSelected = () => {
    if (selectedCities.length === 0) {
      alert("Please select at least one city.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedCities.length} selected city/cities?`
    );

    if (!confirmed) return;

    setCities((previous) =>
      previous.filter(
        (city) => !selectedCities.includes(city.id)
      )
    );

    console.log("Delete Selected Cities:", selectedCities);

    setSelectedCities([]);

    // =======================================================
    // API BULK DELETE CALL WILL BE CONNECTED HERE LATER
    // =======================================================
  };

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="manage-cities-select-header">
            <input
              type="checkbox"
              className="manage-cities-checkbox"
              checked={
                cities.length > 0 &&
                selectedCities.length === cities.length
              }
              onChange={handleSelectAll}
            />

            <span>All Select</span>
          </div>
        ),
        sortable: false,

        render: (_, row) => (
          <input
            type="checkbox"
            className="manage-cities-checkbox"
            checked={selectedCities.includes(row.id)}
            onChange={() => handleSelectCity(row.id)}
          />
        ),
      },

      {
        key: "serial",
        label: "Sr.No",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      {
        key: "cityName",
        label: "City Name",
        sortable: true,

        render: (value) => (
          <span className="manage-cities-city-name">
            {value}
          </span>
        ),
      },

      {
        key: "actions",
        label: "Action",
        sortable: false,

        render: (_, row) => (
          <div className="manage-cities-actions">

            <button
              type="button"
              className="manage-cities-edit-btn"
              onClick={() => handleEdit(row)}
            >
              Edit
            </button>

            <button
              type="button"
              className="manage-cities-delete-btn"
              onClick={() => handleDelete(row)}
            >
              Delete
            </button>

          </div>
        ),
      },
    ],
    [cities, selectedCities]
  );

  return (
    <div className="manage-cities-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="manage-cities-header">

        <h2 className="manage-cities-title">
          All Cities List
        </h2>

        <div className="manage-cities-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="manage-cities-breadcrumb-active">
            Manage Cities
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="manage-cities-card">

        {/* ===================================================
            EXCEL IMPORT
        =================================================== */}

        <div className="manage-cities-import-section">

          <div className="manage-cities-file-row">

            <label
              htmlFor="cityExcelFile"
              className="manage-cities-file-label"
            >
              Select Excel File
            </label>

            <input
              id="cityExcelFile"
              type="file"
              accept=".xlsx,.xls"
              className="manage-cities-file-input"
              onChange={handleFileChange}
            />

            <span className="manage-cities-file-name">
              {selectedFile
                ? selectedFile.name
                : "No file selected"}
            </span>

          </div>

          <button
            type="button"
            className="manage-cities-import-btn"
            onClick={handleImport}
          >
            Import
          </button>

        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="manage-cities-table-wrapper">

          <DataTable
            columns={columns}
            data={cities}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

        {/* ===================================================
            DELETE SELECTED
        =================================================== */}

        {selectedCities.length > 0 && (
          <div className="manage-cities-bottom-actions">

            <button
              type="button"
              className="manage-cities-delete-selected-btn"
              onClick={handleDeleteSelected}
            >
              Delete Selected ({selectedCities.length})
            </button>

          </div>
        )}

      </div>

    </div>
  );
};

export default ManageCities;