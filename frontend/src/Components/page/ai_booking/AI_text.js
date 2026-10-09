import React, { useState } from "react";
import { FaImage, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { Link } from "react-router-dom";

import "./ai_text.css";

const AiText = () => {
  // =========================================================
  // TEMPORARY DATA
  // Later this data will come from API
  // =========================================================

  const [aiTextData, setAiTextData] = useState([
    {
      id: 1,
      title: "Hey Pollen, I need to clean my house next weekend.",
      image:
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    },
    {
      id: 2,
      title: "Hey Pollen, I need to install an electric car charger.",
      image:
        "https://images.unsplash.com/photo-1592833159155-c62df1b65634?w=800",
    },
    {
      id: 3,
      title: "Hey Pollen, I want to order pizza.",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    },
  ]);

  // Maximum cards
  const MAX_AI_TEXT = 4;

  // =========================================================
  // EDIT
  // Later API integration
  // =========================================================

  const handleEdit = (id) => {
    console.log("Edit AI Text:", id);

    // Later:
    // navigate(`/ai_text/edit/${id}`);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this AI Text?",
    );

    if (!confirmed) return;

    setAiTextData((previous) => previous.filter((item) => item.id !== id));

    console.log("Delete AI Text:", id);

    // Later API call
  };

  // =========================================================
  // ADD NEW
  // =========================================================

  const handleAdd = () => {
    console.log("Add New AI Text");

    // Later:
    // navigate("/ai_text/add");
  };

  return (
    <div className="ai-text-page">
      <div className="ai-text-page-header">
        <div>
          <h2 className="ai-text-page-title">AI Text</h2>

          <div className="ai-text-breadcrumb">
            <Link to="/home">Home</Link>

            <span>
              <IoIosArrowForward />
            </span>

            <span className="ai-text-breadcrumb-active">AI Text</span>
          </div>
        </div>
      </div>

      <div className="ai-text-card">
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="ai-text-header">
          <div className="ai-text-header-title">
            <FaImage className="ai-text-header-icon" />

            <h2>AI Text (Title + Image)</h2>
          </div>

          <div className="ai-text-count">
            {aiTextData.length} / {MAX_AI_TEXT} added
          </div>
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="ai-text-content">
          <div className="ai-text-grid">
            {/* =================================================
                EXISTING AI TEXT CARDS
            ================================================= */}

            {aiTextData.map((item) => (
              <div className="ai-text-item" key={item.id}>
                {/* IMAGE */}

                <div className="ai-text-image-wrapper">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="ai-text-image"
                  />
                </div>

                {/* CARD BODY */}

                <div className="ai-text-body">
                  <div className="ai-text-title">{item.title}</div>

                  {/* ACTIONS */}

                  <div className="ai-text-actions">
                    <button
                      type="button"
                      className="ai-text-edit-btn"
                      onClick={() => handleEdit(item.id)}
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="ai-text-delete-btn"
                      onClick={() => handleDelete(item.id)}
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* =================================================
                ADD NEW CARD
            ================================================= */}

            {aiTextData.length < MAX_AI_TEXT && (
              <button
                type="button"
                className="ai-text-add-card"
                onClick={handleAdd}
              >
                <div className="ai-text-add-icon">
                  <FaPlus />
                </div>

                <div className="ai-text-add-text">Add AI Text</div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiText;
