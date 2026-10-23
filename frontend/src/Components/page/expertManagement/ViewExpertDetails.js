import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaRedoAlt,
  FaUpload,
} from "react-icons/fa";

import "./viewExpertDetails.css";
import { getImage } from "../../utils/images";
import api from "../../../config/api";
import ServiceBreadcrumbs from "../../../Components/common/ServiceBreadcrumbs";
import ServiceSuccessModal from "../../../Components/common/modal/serviceModal/ServiceSuccessModal";
import ServiceConfirmModal from "../../../Components/common/modal/serviceModal/ServiceConfirmModal"; // adjust path if different

/* =========================================================
   CONFIG
========================================================= */

const ROUTES = {
  expertList: "/view_experts",
};

const MAX_DOCUMENT_SIZE_MB = 5;
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EMPTY_PROFILE = {
  image: "",
  vendorName: "",
  name: "",
  email: "",
  mobile: "",
  city: "",
  cityId: "",
  about: "",
  status: 0,
  accountHolder: "",
  accountNumber: "",
  branchName: "",
  ifscCode: "",
  contractId: "",
  tradeLicense: "",
  ownerId: "",
  idProof: "",
  idProofTwo: "",
};

// fields the admin can edit (used for the unsaved-changes check)
const EDITABLE_FIELDS = [
  "name",
  "email",
  "mobile",
  "cityId",
  "about",
  "accountHolder",
  "accountNumber",
  "branchName",
  "ifscCode",
];

const PERSONAL_FIELDS = [
  { key: "name", label: "Full name", placeholder: "Enter full name" },
  {
    key: "email",
    label: "Email",
    type: "email",
    placeholder: "name@example.com",
  },
  {
    key: "mobile",
    label: "Mobile",
    type: "tel",
    placeholder: "Enter mobile number",
  },
];

const BANK_FIELDS = [
  {
    key: "accountHolder",
    label: "Account holder name",
    placeholder: "Name as per bank account",
  },
  {
    key: "accountNumber",
    label: "Account number",
    placeholder: "Enter account number",
  },
  { key: "branchName", label: "Branch name", placeholder: "Enter branch name" },
  { key: "ifscCode", label: "IFSC code", placeholder: "e.g. SBIN0001234" },
];

const DOCUMENT_FIELDS = [
  { label: "Aadhar Card", field: "contractId" },
  { label: "Driving Licence", field: "tradeLicense" },
  { label: "Documents", field: "ownerId" },
  { label: "ID Proof", field: "idProof" },
  { label: "ID Proof Two", field: "idProofTwo" },
];

/* =========================================================
   API SERVICE LAYER (swap endpoints here only)
========================================================= */

const expertService = {
  getDetails: (id) => api.get(`/admin/expert_details/${id}`),
  getCities: () => api.get("/admin/cities"),
  update: (id, payload) => api.put(`/admin/update_expert/${id}`, payload),

  // TODO: replace both stubs with real api calls when the endpoints are ready
  updateStatus: async (id, status) => ({ data: { success: true, id, status } }),
  uploadDocument: async (id, field, file) => ({
    data: { success: true, id, field, fileName: file.name },
  }),
};

const mapProfile = (data) => ({
  ...EMPTY_PROFILE,
  image: data.image || "",
  vendorName: data.vendor_name || "",
  name: data.name || "",
  email: data.email || "",
  mobile: data.mobile || "",
  city: data.city_name || "",
  cityId: data.city_id ?? "",
  about: data.about || "",
  status: Number(data.status) === 1 ? 1 : 0,
  accountHolder: data.account_holder || "",
  accountNumber: data.account_number || "",
  branchName: data.branch_name || "",
  ifscCode: data.ifsc_code || "",
  contractId: data.contract_id || "",
  tradeLicense: data.trade_license || "",
  ownerId: data.owner_id || "",
  idProof: data.id_proof || "",
  idProofTwo: data.id_proof_two || "",
});

const buildUpdatePayload = (profile) => ({
  name: profile.name.trim(),
  email: profile.email.trim(),
  mobile: profile.mobile.trim(),
  city_id: profile.cityId,
  about: profile.about,
  account_holder: profile.accountHolder,
  account_number: profile.accountNumber,
  branch_name: profile.branchName,
  ifsc_code: profile.ifscCode,
});

/*
 * The original PHP links files using:
 * base_url('uploads/Ids/' . $filename)
 *
 * Confirm that your Node backend serves this same public path
 * before relying on these links.
 */
const getDocumentUrl = (filename) => {
  if (!filename) return "";

  const baseURL = api.defaults?.baseURL;

  if (!baseURL) return "";

  const serverOrigin = new URL(baseURL, window.location.origin).origin;

  return `${serverOrigin}/uploads/Ids/${encodeURIComponent(filename)}`;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function ViewExpertDetails() {
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [savedProfile, setSavedProfile] = useState(EMPTY_PROFILE);
  const [cities, setCities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null); // { title, message }
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({}); // { field: { name, url } }
  const [uploadingField, setUploadingField] = useState("");
  const [docError, setDocError] = useState("");
  const uploadedDocsRef = useRef({});
  const [errors, setErrors] = useState({});

  /* ---------- load ---------- */

  const loadProfile = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setLoadError("Expert ID is missing.");
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      setLoadError("");

      try {
        const response = await expertService.getDetails(id);
        const data = response.data?.data || response.data;

        if (!data) throw new Error("Expert not found.");

        const mapped = mapProfile(data);

        setProfile(mapped);
        setSavedProfile(mapped);
      } catch (err) {
        setLoadError(
          err.response?.data?.message ||
            err.message ||
            "Could not load expert details.",
        );
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    loadProfile();

    const loadCities = async () => {
      try {
        const response = await expertService.getCities();

        if (response.data.success) setCities(response.data.data || []);
      } catch (err) {
        console.error("Failed to fetch cities:", err);
      }
    };

    loadCities();
  }, [loadProfile]);

  /* ---------- free local preview URLs on unmount ---------- */

  useEffect(
    () => () => {
      Object.values(uploadedDocsRef.current).forEach((doc) =>
        URL.revokeObjectURL(doc.url),
      );
    },
    [],
  );

  /* ---------- derived ---------- */

  const isActive = profile.status === 1;

  const isDirty = EDITABLE_FIELDS.some(
    (field) => String(profile[field]) !== String(savedProfile[field]),
  );

  const documents = DOCUMENT_FIELDS.map(({ label, field }) => {
    const uploaded = uploadedDocs[field];
    const filename = uploaded?.name || profile[field];

    return {
      label,
      field,
      filename,
      url: uploaded?.url || getDocumentUrl(profile[field]),
      submitted: Boolean(filename),
    };
  });

  const submittedCount = documents.filter((doc) => doc.submitted).length;

  const documentProgress = Math.round(
    (submittedCount / DOCUMENT_FIELDS.length) * 100,
  );

  /* ---------- handlers ---------- */

  const handleChange = (field, value) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
    setSaveError("");
  };

  const handleDiscard = () => {
    setProfile(savedProfile);
    setErrors({});
    setSaveError("");
  };

  const validate = () => {
    const next = {};

    if (!profile.name.trim()) next.name = "Enter the full name";

    if (
      profile.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
    ) {
      next.email = "Enter a valid email address";
    }

    const mobileDigits = profile.mobile.replace(/\D/g, "");

    if (
      profile.mobile.trim() &&
      (mobileDigits.length < 7 || mobileDigits.length > 15)
    ) {
      next.mobile = "Enter a valid mobile number";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSaving(true);
    setSaveError("");

    try {
      await expertService.update(id, buildUpdatePayload(profile));

      await loadProfile({ silent: true });
      setSuccess({
        title: "Expert updated",
        message: "The expert details have been saved successfully.",
      });
    } catch (err) {
      setSaveError(
        err.response?.data?.message ||
          err.message ||
          "Could not save expert details.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessClose = useCallback(() => setSuccess(null), []);

  /* ---------- account status (UI only for now) ---------- */

  const handleStatusConfirm = async () => {
    const nextStatus = isActive ? 0 : 1;

    await expertService.updateStatus(id, nextStatus);

    setProfile((previous) => ({ ...previous, status: nextStatus }));
    setSavedProfile((previous) => ({ ...previous, status: nextStatus }));
    setStatusConfirmOpen(false);
    setSuccess({
      title: "Status updated",
      message: `The account is now ${nextStatus === 1 ? "active" : "inactive"}.`,
    });
  };

  /* ---------- document upload (UI only for now) ---------- */

  const handleDocumentSelect = async (field, label, event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setDocError("");

    if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
      setDocError("Only PDF, JPG, PNG or WEBP files are allowed.");
      return;
    }

    if (file.size > MAX_DOCUMENT_SIZE_MB * 1024 * 1024) {
      setDocError(`File must be smaller than ${MAX_DOCUMENT_SIZE_MB} MB.`);
      return;
    }

    try {
      setUploadingField(field);

      await expertService.uploadDocument(id, field, file);

      const previous = uploadedDocsRef.current[field];

      if (previous) URL.revokeObjectURL(previous.url);

      uploadedDocsRef.current = {
        ...uploadedDocsRef.current,
        [field]: { name: file.name, url: URL.createObjectURL(file) },
      };

      setUploadedDocs(uploadedDocsRef.current);
      setSuccess({
        title: "Document uploaded",
        message: `${label} has been uploaded successfully.`,
      });
    } catch (err) {
      setDocError(
        err.response?.data?.message || err.message || "Upload failed.",
      );
    } finally {
      setUploadingField("");
    }
  };

  /* ---------- field renderer (plain function, not a component) ---------- */

  const renderField = ({ key, label, type = "text", placeholder }) => (
    <div
      key={key}
      className={`vd-field ${errors[key] ? "has-error" : ""}`.trim()}
    >
      <label htmlFor={key}>
        {label}
        {key === "name" && <span className="vd-required">*</span>}
      </label>

      <input
        id={key}
        type={type}
        value={profile[key]}
        placeholder={placeholder}
        onChange={(event) => handleChange(key, event.target.value)}
        autoComplete="off"
      />

      {errors[key] && <small className="vd-error">{errors[key]}</small>}
    </div>
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="view-details">
      {/* ---------- PAGE HEADER ---------- */}

      <header className="vd-page-header">
        <h2 className="vd-page-title">Expert Details</h2>

        <ServiceBreadcrumbs
          items={[
            { label: "Expert List", to: ROUTES.expertList },
            { label: "Expert Details" },
          ]}
        />
      </header>

      {loading && (
        <div className="vd-state-card">
          <i className="vd-spinner" aria-hidden="true" />
          <span>Loading expert details…</span>
        </div>
      )}

      {!loading && loadError && (
        <div className="vd-state-card vd-state-error" role="alert">
          <p>{loadError}</p>

          <button
            type="button"
            className="vd-secondary-button"
            onClick={() => loadProfile()}
          >
            <FaRedoAlt />
            <span>Try again</span>
          </button>
        </div>
      )}

      {!loading && !loadError && (
        <>
          {/* ---------- PROFILE SUMMARY ---------- */}

          <section className="vd-summary">
            <div className="vd-avatar">
              {profile.image ? (
                <img
                  src={getImage(profile.image)}
                  alt={`${profile.name || "Expert"} profile`}
                />
              ) : (
                <span>{(profile.name || "?").charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="vd-summary-body">
              <div className="vd-summary-top">
                <div>
                  <h3 className="vd-summary-name">{profile.name || "—"}</h3>
                  <p className="vd-summary-vendor">
                    {profile.vendorName
                      ? `Vendor: ${profile.vendorName}`
                      : "No vendor assigned"}
                  </p>
                </div>

                <button
                  type="button"
                  className={`vd-status-chip is-button ${
                    isActive ? "is-active" : "is-inactive"
                  }`}
                  title="Click to change account status"
                  onClick={() => setStatusConfirmOpen(true)}
                >
                  <span className="vd-status-dot" aria-hidden="true" />
                  {isActive ? "Account Active" : "Account Inactive"}
                </button>
              </div>

              <ul className="vd-summary-meta">
                {savedProfile.email && (
                  <li>
                    <FaEnvelope />
                    <span>{savedProfile.email}</span>
                  </li>
                )}

                {savedProfile.mobile && (
                  <li>
                    <FaPhoneAlt />
                    <span>{savedProfile.mobile}</span>
                  </li>
                )}

                {savedProfile.city && (
                  <li>
                    <FaMapMarkerAlt />
                    <span>{savedProfile.city}</span>
                  </li>
                )}
              </ul>
            </div>
          </section>

          {/* ---------- TABS + PANEL ---------- */}

          <div className="vd-card">
            <nav className="vd-tabs" role="tablist" aria-label="Expert details">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "profile"}
                className={`vd-tab ${activeTab === "profile" ? "is-active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "documents"}
                className={`vd-tab ${activeTab === "documents" ? "is-active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                Documents
                <span className="vd-tab-count">
                  {submittedCount}/{DOCUMENT_FIELDS.length}
                </span>
              </button>
            </nav>

            {activeTab === "profile" && (
              <form className="vd-form" onSubmit={handleSave} noValidate>
                {saveError && (
                  <div className="vd-alert" role="alert">
                    {saveError}
                  </div>
                )}

                <section className="vd-section">
                  <h4 className="vd-section-title">Personal detail</h4>

                  <div className="vd-grid">
                    {PERSONAL_FIELDS.map(renderField)}

                    <div className="vd-field">
                      <label htmlFor="cityId">City</label>

                      <select
                        id="cityId"
                        value={profile.cityId}
                        onChange={(event) =>
                          handleChange("cityId", event.target.value)
                        }
                      >
                        <option value="">Select city</option>

                        {cities.map((city) => (
                          <option key={city.id} value={String(city.id)}>
                            {city.city_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="vd-field vd-field-wide">
                      <label htmlFor="about">About</label>

                      <textarea
                        id="about"
                        rows={3}
                        value={profile.about}
                        placeholder="Write a short introduction about the expert"
                        onChange={(event) =>
                          handleChange("about", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="vd-section">
                  <h4 className="vd-section-title">Bank detail</h4>

                  <div className="vd-grid">{BANK_FIELDS.map(renderField)}</div>
                </section>

                <div className="vd-form-footer">
                  {isDirty && !saving && (
                    <span className="vd-unsaved">You have unsaved changes</span>
                  )}

                  <button
                    type="button"
                    className="vd-secondary-button"
                    onClick={handleDiscard}
                    disabled={!isDirty || saving}
                  >
                    Discard
                  </button>

                  <button
                    type="submit"
                    className="vd-primary-button"
                    disabled={!isDirty || saving}
                  >
                    {saving && <i className="vd-spinner vd-spinner-light" />}
                    <span>{saving ? "Saving…" : "Update now"}</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === "documents" && (
              <section className="vd-documents">
                {docError && (
                  <div className="vd-alert vd-alert-inline" role="alert">
                    {docError}
                  </div>
                )}

                <div className="vd-documents-summary">
                  <span>
                    {submittedCount} of {DOCUMENT_FIELDS.length} documents
                    submitted · PDF, JPG, PNG or WEBP up to{" "}
                    {MAX_DOCUMENT_SIZE_MB} MB
                  </span>

                  <div
                    className="vd-progress-track"
                    role="progressbar"
                    aria-valuenow={documentProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Documents submitted"
                  >
                    <div
                      className="vd-progress-fill"
                      style={{ width: `${documentProgress}%` }}
                    />
                  </div>
                </div>

                <ul className="vd-document-list">
                  {documents.map(({ label, field, filename, url, submitted }) => {
                    const isUploading = uploadingField === field;

                    return (
                      <li key={field} className="vd-document-row">
                        <div className="vd-document-info">
                          <span className="vd-document-label">{label}</span>

                          {filename && (
                            <span className="vd-document-filename">
                              {filename}
                            </span>
                          )}
                        </div>

                        <div className="vd-document-actions">
                          {submitted && url ? (
                            <a
                              className="vd-view-button"
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <FaExternalLinkAlt />
                              <span>View</span>
                            </a>
                          ) : (
                            <span
                              className={`vd-status-chip ${
                                submitted ? "is-active" : "is-pending"
                              }`}
                            >
                              <span
                                className="vd-status-dot"
                                aria-hidden="true"
                              />
                              {submitted ? "Submitted" : "Not submitted"}
                            </span>
                          )}

                          <input
                            id={`doc-${field}`}
                            type="file"
                            className="vd-file-input"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            disabled={isUploading}
                            onChange={(event) =>
                              handleDocumentSelect(field, label, event)
                            }
                          />

                          <label
                            htmlFor={`doc-${field}`}
                            className={`vd-upload-button ${
                              isUploading ? "is-disabled" : ""
                            }`.trim()}
                          >
                            {isUploading ? (
                              <i className="vd-spinner vd-spinner-small" />
                            ) : (
                              <FaUpload />
                            )}
                            <span>
                              {isUploading
                                ? "Uploading…"
                                : submitted
                                  ? "Replace"
                                  : "Upload"}
                            </span>
                          </label>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        </>
      )}

      {/* ---------- SUCCESS MODAL ---------- */}

      <ServiceSuccessModal
        isOpen={Boolean(success)}
        title={success?.title}
        message={success?.message}
        buttonText="Done"
        onClose={handleSuccessClose}
      />

      {/* ---------- STATUS CONFIRM MODAL ---------- */}

      <ServiceConfirmModal
        isOpen={statusConfirmOpen}
        title={isActive ? "Deactivate account?" : "Activate account?"}
        message={`The expert's account will be set to ${
          isActive ? "inactive" : "active"
        }. You can change it again at any time.`}
        confirmText={isActive ? "Yes, deactivate" : "Yes, activate"}
        onConfirm={handleStatusConfirm}
        onCancel={() => setStatusConfirmOpen(false)}
      />
    </div>
  );
}