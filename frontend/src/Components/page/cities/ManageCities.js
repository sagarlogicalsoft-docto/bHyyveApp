import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  MdClose,
  MdDeleteOutline,
  MdEdit,
  MdLocationCity,
  MdUploadFile,
} from "react-icons/md";

import api from "../../../config/api";
import DataTable from "../../common/DataTable";
import ServiceBreadcrumbs from "../../common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../common/modal/serviceModal/ServiceSuccessModal";
import ServiceConfirmModal from "../../common/modal/serviceModal/ServiceConfirmModal";

import "./manageCities.css";

// =========================================================
// API SERVICE (kept inline; move to a service layer later)
// =========================================================

const listCitiesRequest = () => api.get("/admin/service_side_cities");

const importCitiesRequest = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("import", "Import");

  return api.post("/admin/service_side_cities/import", formData);
};

const updateCityRequest = (id, cityName) =>
  api.post(`/admin/service_side_cities/${id}/edit`, {
    id,
    city_name: cityName,
    save: "update",
  });

const deleteCityRequest = (id) => api.delete(`/admin/service_side_cities/${id}`);

const deleteSelectedCitiesRequest = (cityIds) =>
  api.post("/admin/service_side_cities/delete_selected", {
    city_ids: cityIds,
  });

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

const ManageCities = () => {
  const fileInputRef = useRef(null);

  const [cities, setCities] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // modal = null | { type: "edit" | "delete", row } | { type: "deleteSelected" }
  // (delete types are shown by ServiceConfirmModal, edit by the inline popup)
  const [modal, setModal] = useState(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [editName, setEditName] = useState("");

  const [success, setSuccess] = useState({
    open: false,
    title: "",
    message: "",
  });

  const showSuccess = (title, message) =>
    setSuccess({ open: true, title, message });

  // Stable reference so the success modal's auto-close timer isn't reset
  const closeSuccess = useCallback(
    () => setSuccess((previous) => ({ ...previous, open: false })),
    []
  );

  // =========================================================
  // LOAD CITIES
  // =========================================================

  const fetchCities = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setErrorMessage("");

      const response = await listCitiesRequest();

      if (response.data?.success) {
        const rows = (response.data.data || []).map((city) => ({
          id: city.id,
          cityName: city.city_name,
        }));

        setCities(rows);

        // drop selections that no longer exist
        setSelectedCities((previous) =>
          previous.filter((id) => rows.some((row) => row.id === id))
        );
      } else {
        setErrorMessage(response.data?.message || "Unable to load cities.");
      }
    } catch (error) {
      console.error("Fetch cities error:", error);
      setErrorMessage(getErrorMessage(error, "Unable to load cities."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // =========================================================
  // MODAL: ESCAPE KEY + BODY SCROLL LOCK
  // =========================================================

  const closeModal = useCallback(() => {
    if (modalBusy) return;
    setModal(null);
    setModalError("");
  }, [modalBusy]);

  useEffect(() => {
    if (modal?.type !== "edit") return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal?.type, closeModal]);

  // =========================================================
  // SELECTION
  // =========================================================

  const handleSelectAll = (event) => {
    setSelectedCities(event.target.checked ? cities.map((city) => city.id) : []);
  };

  const handleSelectCity = (id) => {
    setSelectedCities((previous) =>
      previous.includes(id)
        ? previous.filter((cityId) => cityId !== id)
        : [...previous, id]
    );
  };

  // =========================================================
  // IMPORT (single button: pick file -> validate -> upload)
  // =========================================================

  const handleImportClick = () => {
    if (!importing) fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    // reset so picking the same file again still fires onChange
    event.target.value = "";

    if (!file) return;

    setErrorMessage("");

    const extension = file.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls"].includes(extension)) {
      setErrorMessage("Please select an XLSX or XLS file.");
      return;
    }

    try {
      setImporting(true);

      const response = await importCitiesRequest(file);

      if (response.data?.success) {
        showSuccess(
          "Import Complete!",
          response.data.message || "Cities imported successfully."
        );
        await fetchCities(true);
      } else {
        setErrorMessage(response.data?.message || "Unable to import cities.");
      }
    } catch (error) {
      console.error("Import cities error:", error);
      setErrorMessage(getErrorMessage(error, "Unable to import cities."));
    } finally {
      setImporting(false);
    }
  };

  // =========================================================
  // OPEN MODALS
  // =========================================================

  const openEdit = useCallback((row) => {
    setEditName(row.cityName);
    setModalError("");
    setModal({ type: "edit", row });
  }, []);

  const openDelete = useCallback((row) => {
    setModalError("");
    setModal({ type: "delete", row });
  }, []);

  const openDeleteSelected = () => {
    if (selectedCities.length === 0) return;
    setModalError("");
    setModal({ type: "deleteSelected" });
  };

  // =========================================================
  // EDIT CITY
  // =========================================================

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    const trimmedName = editName.trim();

    if (!trimmedName) {
      setModalError("Please enter city name.");
      return;
    }

    try {
      setModalBusy(true);
      setModalError("");

      const response = await updateCityRequest(modal.row.id, trimmedName);

      if (response.data?.success) {
        setModal(null);
        showSuccess(
          "City Updated!",
          response.data.message || "City updated successfully."
        );
        await fetchCities(true);
      } else {
        setModalError(response.data?.message || "Unable to update city.");
      }
    } catch (error) {
      console.error("Update city error:", error);
      setModalError(getErrorMessage(error, "Unable to update city."));
    } finally {
      setModalBusy(false);
    }
  };

  // =========================================================
  // DELETE (single + selected)
  // =========================================================

  // Called by ServiceConfirmModal (it handles its own loading state).
  // Errors can't be shown inside that modal, so they go to the page alert.
  const handleConfirmDelete = async () => {
    const isBulkDelete = modal.type === "deleteSelected";
    const deletedId = modal.row?.id;

    try {
      const response = isBulkDelete
        ? await deleteSelectedCitiesRequest(selectedCities)
        : await deleteCityRequest(deletedId);

      setModal(null);

      if (response.data?.success) {
        if (isBulkDelete) {
          setSelectedCities([]);
        } else {
          setSelectedCities((previous) =>
            previous.filter((id) => id !== deletedId)
          );
        }

        showSuccess(
          isBulkDelete ? "Cities Deleted!" : "City Deleted!",
          response.data.message ||
            (isBulkDelete
              ? "Selected cities deleted successfully."
              : "City deleted successfully.")
        );
        await fetchCities(true);
      } else {
        setErrorMessage(response.data?.message || "Unable to delete.");
      }
    } catch (error) {
      console.error("Delete cities error:", error);
      setModal(null);
      setErrorMessage(getErrorMessage(error, "Unable to delete."));
    }
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
                cities.length > 0 && selectedCities.length === cities.length
              }
              onChange={handleSelectAll}
              aria-label="Select all cities"
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
            aria-label={`Select ${row.cityName}`}
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
          <span className="manage-cities-city-name">{value}</span>
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
              onClick={() => openEdit(row)}
            >
              <MdEdit aria-hidden="true" />
              Edit
            </button>

            <button
              type="button"
              className="manage-cities-delete-btn"
              onClick={() => openDelete(row)}
            >
              <MdDeleteOutline aria-hidden="true" />
              Delete
            </button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cities, selectedCities, openEdit, openDelete]
  );

  // =========================================================
  // PAGE
  // =========================================================

  const isEdit = modal?.type === "edit";
  const isBulk = modal?.type === "deleteSelected";
  const isDelete = isBulk || modal?.type === "delete";

  return (
    <div className="manage-cities-page">
      {/* PAGE HEADER */}

      <div className="manage-cities-header">
        <h2 className="manage-cities-title">All Cities List</h2>
        <ServiceBreadcrumbs items={[{ label: "Manage Cities" }]} />
      </div>

      {/* MAIN CARD */}

      <div className="manage-cities-card">
        {/* TOOLBAR */}

        <div className="manage-cities-toolbar">
          <div className="manage-cities-toolbar-info">
            <span className="manage-cities-toolbar-icon" aria-hidden="true">
              <MdLocationCity />
            </span>

            <div>
              <h3>Service Cities</h3>
              <p>
                {cities.length} {cities.length === 1 ? "city" : "cities"} total
              </p>
            </div>
          </div>

          <div className="manage-cities-toolbar-actions">
            {/* SINGLE IMPORT BUTTON: selects the file and imports it */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="manage-cities-file-input"
              onChange={handleFileChange}
              tabIndex={-1}
            />

            <button
              type="button"
              className="manage-cities-import-btn"
              onClick={handleImportClick}
              disabled={importing}
              title="Choose an .xlsx or .xls file to import"
            >
              {importing ? (
                <span className="manage-cities-spinner" aria-hidden="true" />
              ) : (
                <MdUploadFile aria-hidden="true" />
              )}
              {importing ? "Importing..." : "Import Excel"}
            </button>
          </div>
        </div>

        {/* API FEEDBACK */}

        {errorMessage && (
          <div className="manage-cities-api-error" role="alert">
            <span>{errorMessage}</span>

            <button
              type="button"
              className="manage-cities-api-error-close"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss"
            >
              <MdClose />
            </button>
          </div>
        )}

        {/* DATA TABLE */}

        <div className="manage-cities-table-wrapper">
          {loading ? (
            <p className="manage-cities-loading">
              <span className="manage-cities-spinner manage-cities-spinner--dark" />
              Loading cities...
            </p>
          ) : (
            <DataTable
              columns={columns}
              data={cities}
              entriesPerPageOptions={[10, 25, 50, 100]}
              defaultEntriesPerPage={10}
              searchable={true}
              sortable={true}
            />
          )}
        </div>
      </div>

      {/* SELECTED ACTION BAR (floating) */}

      {selectedCities.length > 0 && (
        <div className="manage-cities-selected-actions">
          <span className="manage-cities-selected-count">
            {selectedCities.length}{" "}
            {selectedCities.length === 1 ? "city" : "cities"} selected
          </span>

          <div className="manage-cities-selected-buttons">
            <button
              type="button"
              className="manage-cities-selected-cancel-btn"
              onClick={() => setSelectedCities([])}
            >
              Cancel
            </button>

            <button
              type="button"
              className="manage-cities-selected-delete-btn"
              onClick={openDeleteSelected}
            >
              <MdDeleteOutline aria-hidden="true" />({selectedCities.length})
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* EDIT POPUP */}

      {isEdit &&
        createPortal(
          <div className="manage-cities-overlay" onClick={closeModal}>
            <div
              className="manage-cities-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="manage-cities-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <form onSubmit={handleSaveEdit} noValidate>
                <div className="manage-cities-modal-head">
                  <span className="manage-cities-modal-badge" aria-hidden="true">
                    <MdEdit />
                  </span>

                  <div>
                    <h3 id="manage-cities-modal-title">Edit City</h3>
                    <p>Update the city name and save your changes.</p>
                  </div>

                  <button
                    type="button"
                    className="manage-cities-modal-close"
                    onClick={closeModal}
                    disabled={modalBusy}
                    aria-label="Close"
                  >
                    <MdClose />
                  </button>
                </div>

                <div className="manage-cities-modal-body">
                  <label htmlFor="manageCitiesEditName">
                    City Name<span>*</span>
                  </label>

                  <div
                    className={`manage-cities-input-wrap${
                      modalError ? " manage-cities-input-wrap--error" : ""
                    }`}
                  >
                    <MdLocationCity
                      className="manage-cities-input-icon"
                      aria-hidden="true"
                    />

                    <input
                      id="manageCitiesEditName"
                      type="text"
                      value={editName}
                      placeholder="Enter city name"
                      onChange={(event) => {
                        setEditName(event.target.value);
                        setModalError("");
                      }}
                      disabled={modalBusy}
                      aria-invalid={Boolean(modalError)}
                      autoComplete="off"
                      autoFocus
                    />
                  </div>

                  {modalError && (
                    <p className="manage-cities-modal-error" role="alert">
                      {modalError}
                    </p>
                  )}
                </div>

                <div className="manage-cities-modal-footer">
                  <button
                    type="button"
                    className="manage-cities-btn-secondary"
                    onClick={closeModal}
                    disabled={modalBusy}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="manage-cities-btn-primary"
                    disabled={
                      modalBusy ||
                      !editName.trim() ||
                      editName.trim() === modal.row.cityName
                    }
                  >
                    {modalBusy && (
                      <span className="manage-cities-spinner" aria-hidden="true" />
                    )}
                    {modalBusy ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* DELETE CONFIRM */}

      <ServiceConfirmModal
        isOpen={isDelete}
        variant="danger"
        title={isBulk ? "Delete Selected Cities?" : "Delete City?"}
        message={
          isBulk
            ? `You are about to delete ${selectedCities.length} selected ${
                selectedCities.length === 1 ? "city" : "cities"
              }. This action cannot be undone.`
            : `Are you sure you want to delete "${modal?.row?.cityName}"? This action cannot be undone.`
        }
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={closeModal}
      />

      {/* SUCCESS MODAL */}

      <ServiceSuccessModal
        isOpen={success.open}
        title={success.title}
        message={success.message}
        onClose={closeSuccess}
      />
    </div>
  );
};

export default ManageCities;