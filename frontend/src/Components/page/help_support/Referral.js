import React from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./referral.css";

const Referral = () => {
  // =========================================================
  // TEMPORARY REFERRAL DATA
  // API DATA CAN BE CONNECTED HERE LATER
  // =========================================================

  const referralData = [
    {
      id: 1,
      referrerName: "Sagar Malik",
      referrerEmail: "sagarmalik8000@gmail.com",
      referrerAmount: "$ 20.00",

      referredName: "Testing Hchc",
      referredEmail: "hfhf@gmail.com",
      referredAmount: "$ 20.00",

      date: "30 Apr 2026",
    },

    {
      id: 2,
      referrerName: "Sagar Malik",
      referrerEmail: "sagarmalik8000@gmail.com",
      referrerAmount: "$ 20.00",

      referredName: "U",
      referredEmail: "",
      referredAmount: "$ 20.00",

      date: "30 Apr 2026",
    },

    {
      id: 3,
      referrerName: "Sagar Malik",
      referrerEmail: "sagarmalik8000@gmail.com",
      referrerAmount: "$ 20.00",

      referredName: "U",
      referredEmail: "",
      referredAmount: "$ 20.00",

      date: "30 Apr 2026",
    },

    {
      id: 4,
      referrerName: "Sagar Malik",
      referrerEmail: "sagarmalik8000@gmail.com",
      referrerAmount: "$ 20.00",

      referredName: "Testing User",
      referredEmail: "testing@example.com",
      referredAmount: "$ 20.00",

      date: "29 Apr 2026",
    },

    {
      id: 5,
      referrerName: "Rahul Testing",
      referrerEmail: "rahultesting@example.com",
      referrerAmount: "$ 20.00",

      referredName: "New Customer",
      referredEmail: "customer@example.com",
      referredAmount: "$ 20.00",

      date: "28 Apr 2026",
    },
  ];

  return (
    <div className="referral-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="referral-header">

        <h2 className="referral-title">
          Referral
        </h2>

        <div className="referral-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="referral-breadcrumb-active">
            Referral
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="referral-card">

        <div className="referral-card-header">
          <h3>
            All Referral
          </h3>
        </div>

        {/* ===================================================
            NORMAL TABLE
        =================================================== */}

        <div className="referral-table-wrapper">

          <table className="referral-table">

            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Referrer By</th>
                <th>Referred To</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {referralData.map((referral, index) => (
                <tr key={referral.id}>

                  {/* Sr.No */}

                  <td>
                    {index + 1}
                  </td>

                  {/* Referrer By */}

                  <td>
                    <div className="referral-user">

                      <div className="referral-user-name">
                        {referral.referrerName}
                      </div>

                      <div className="referral-user-email">
                        {referral.referrerEmail}
                      </div>

                      <div className="referral-user-amount">
                        {referral.referrerAmount}
                      </div>

                    </div>
                  </td>

                  {/* Referred To */}

                  <td>
                    <div className="referral-user">

                      <div className="referral-user-name">
                        {referral.referredName}
                      </div>

                      {referral.referredEmail && (
                        <div className="referral-user-email">
                          {referral.referredEmail}
                        </div>
                      )}

                      <div className="referral-user-amount">
                        {referral.referredAmount}
                      </div>

                    </div>
                  </td>

                  {/* Date */}

                  <td>
                    <span className="referral-date">
                      {referral.date}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Referral;