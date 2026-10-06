import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import DataTable from "../../common/DataTable";

import "./userFeedback.css";

const UserFeedback = () => {
  // =========================================================
  // TEMPORARY FEEDBACK DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const [feedbackData] = useState([
    {
      id: 1,
      userName: "Sagar Malik",
      userMobile: "9876543210",
      userEmail: "sagar.malik@gmail.com",
      feedback:
        "The service was very good and the booking process was simple and easy to understand.",
      dateTime: "2026/08/14 03:05PM",
    },
    {
      id: 2,
      userName: "Rahul Testing",
      userMobile: "9876501234",
      userEmail: "rahul.testing@gmail.com",
      feedback:
        "Very good experience. The vendor responded quickly and completed the service on time.",
      dateTime: "2026/08/14 02:15PM",
    },
    {
      id: 3,
      userName: "Amit Kumar",
      userMobile: "9988776655",
      userEmail: "amit.kumar@gmail.com",
      feedback:
        "The application is easy to use but the notification system can be improved.",
      dateTime: "2026/08/13 11:45AM",
    },
    {
      id: 4,
      userName: "Priya Sharma",
      userMobile: "9876123456",
      userEmail: "priya.sharma@gmail.com",
      feedback:
        "I liked the overall service. Everything was properly managed and the vendor was helpful.",
      dateTime: "2026/08/13 10:30AM",
    },
    {
      id: 5,
      userName: "Vikas Singh",
      userMobile: "9123456780",
      userEmail: "vikas.singh@gmail.com",
      feedback:
        "The booking was completed successfully. I would definitely use this service again.",
      dateTime: "2026/08/12 04:20PM",
    },
    {
      id: 6,
      userName: "Neha Verma",
      userMobile: "9988123456",
      userEmail: "neha.verma@gmail.com",
      feedback:
        "Good service and good communication from the service provider.",
      dateTime: "2026/08/12 01:10PM",
    },
    {
      id: 7,
      userName: "Rohit Gupta",
      userMobile: "9877001122",
      userEmail: "rohit.gupta@gmail.com",
      feedback:
        "The service quality was excellent. The complete process was smooth.",
      dateTime: "2026/08/11 05:40PM",
    },
    {
      id: 8,
      userName: "Anjali Yadav",
      userMobile: "9765432109",
      userEmail: "anjali.yadav@gmail.com",
      feedback:
        "Everything was good, although it would be better if more payment options were available.",
      dateTime: "2026/08/11 12:25PM",
    },
    {
      id: 9,
      userName: "Mohit Sharma",
      userMobile: "9898989898",
      userEmail: "mohit.sharma@gmail.com",
      feedback:
        "I am satisfied with the service and the vendor was professional.",
      dateTime: "2026/08/10 03:50PM",
    },
    {
      id: 10,
      userName: "Pooja Singh",
      userMobile: "9812345678",
      userEmail: "pooja.singh@gmail.com",
      feedback:
        "The overall experience was nice and the service was delivered as expected.",
      dateTime: "2026/08/10 11:15AM",
    },
  ]);

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = useMemo(
    () => [
      // =====================================================
      // SERIAL NUMBER
      // =====================================================

      {
        key: "serial",
        label: "Sr.No",
        width: "80px",
        sortable: true,

        render: (_, row, index) => index + 1,
      },

      // =====================================================
      // USER NAME
      // =====================================================

      {
        key: "userName",
        label: "User Name",
        width: "150px",
        sortable: true,

        render: (value) => (
          <div className="user-feedback-user-name">
            {value}
          </div>
        ),
      },

      // =====================================================
      // USER MOBILE
      // =====================================================

      {
        key: "userMobile",
        label: "User Mobile",
        width: "140px",
        sortable: true,

        render: (value) => (
          <div className="user-feedback-mobile">
            {value}
          </div>
        ),
      },

      // =====================================================
      // USER EMAIL
      // =====================================================

      {
        key: "userEmail",
        label: "User E-mail",
        width: "210px",
        sortable: true,

        render: (value) => (
          <div className="user-feedback-email">
            {value}
          </div>
        ),
      },

      // =====================================================
      // USER FEEDBACK
      // =====================================================

      {
        key: "feedback",
        label: "User Feedback",
        width: "350px",
        sortable: true,

        render: (value) => (
          <div className="user-feedback-message">
            {value}
          </div>
        ),
      },

      // =====================================================
      // DATE TIME
      // =====================================================

      {
        key: "dateTime",
        label: "Date Time",
        width: "160px",
        sortable: true,

        render: (value) => (
          <div className="user-feedback-date-time">
            {value}
          </div>
        ),
      },
    ],
    [],
  );

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="user-feedback-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="user-feedback-header">

        <h2 className="user-feedback-title">
          User Feedback
        </h2>

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="user-feedback-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span className="user-feedback-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>

          <Link to="/help-center">
            Help &amp; Center
          </Link>

          <span className="user-feedback-breadcrumb-arrow">
            <IoIosArrowForward />
          </span>

          <span className="user-feedback-breadcrumb-active">
            User Feedback
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="user-feedback-card">

        <div className="user-feedback-card-header">
          <h3>
            All User Feedback
          </h3>
        </div>

        {/* ===================================================
            DATA TABLE
        =================================================== */}

        <div className="user-feedback-table-wrapper">

          <DataTable
            columns={columns}
            data={feedbackData}
            entriesPerPageOptions={[10, 25, 50, 100]}
            defaultEntriesPerPage={10}
            searchable={true}
            sortable={true}
          />

        </div>

      </div>

    </div>
  );
};

export default UserFeedback;