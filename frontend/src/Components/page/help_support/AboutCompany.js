import React from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";

import "./aboutCompany.css";

const AboutCompany = () => {
  return (
    <div className="about-company-page">

      {/* =====================================================
          PAGE HEADER / BREADCRUMB
      ===================================================== */}

      <div className="about-company-header">

        <h2 className="about-company-title">
          About Company
        </h2>

        <div className="about-company-breadcrumb">

          <Link to="/home">
            Home
          </Link>

          <span>
            <IoIosArrowForward />
          </span>

          <span className="about-company-breadcrumb-active">
            About Company
          </span>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT CARD
      ===================================================== */}

      <div className="about-company-card">

        {/* ===================================================
            ABOUT US
        =================================================== */}

        <section className="about-company-section">

          <div className="about-company-section-heading">
            <span className="about-company-section-number">
              01
            </span>

            <div>
              <h3>
                About Us
              </h3>

              <p>
                About Company
              </p>
            </div>
          </div>

          <div className="about-company-content">

            <p>
              bHyyve is a service technology company that connects
              customers with trusted businesses through a simple,
              digital platform.
            </p>

            <p>
              It enables customers to discover services, access deals
              and offers, and engage directly with providers, while
              helping businesses increase visibility, generate
              qualified leads, and manage customer relationships more
              efficiently.
            </p>

          </div>

        </section>


        {/* ===================================================
            TERMS & CONDITIONS
        =================================================== */}

        <section className="about-company-section">

          <div className="about-company-section-heading">

            <span className="about-company-section-number">
              02
            </span>

            <div>
              <h3>
                Terms &amp; Conditions
              </h3>

              <p>
                Terms and Conditions
              </p>
            </div>

          </div>

          <div className="about-company-content">

            <h4>
              Terms and Conditions
            </h4>

            <p className="about-company-updated">
              Last Updated: April 7th 2025
            </p>

            <p>
              Welcome to bHive! These Terms and Conditions
              ("Terms") govern your access to and use of the bHive
              mobile application (the "App") and any related services
              provided by bHive Technologies ("Company," "we," "us,"
              or "our"). By accessing or using the App, you agree to
              be bound by these Terms. If you do not agree, please do
              not use the App.
            </p>

            <h4>
              1. Overview of Services
            </h4>

            <p>
              bHive is a platform that connects service providers
              ("Providers") with consumers ("Users"). The App allows
              Users to find, review, and book various services, while
              Providers can list and promote their services.
            </p>

            <h4>
              2. Eligibility
            </h4>

            <ul>
              <li>
                You must be at least 18 years old to use the App.
              </li>

              <li>
                By using the App, you represent that you have the
                legal capacity to enter into these Terms.
              </li>

              <li>
                Service Providers must provide accurate business
                details and comply with all applicable laws and
                licensing requirements.
              </li>
            </ul>

            <h4>
              3. User Accounts
            </h4>

            <ul>
              <li>
                To access certain features, you may be required to
                create an account.
              </li>

              <li>
                You are responsible for maintaining the
                confidentiality of your account credentials.
              </li>

              <li>
                You agree to provide accurate and up-to-date
                information.
              </li>

              <li>
                We reserve the right to suspend or terminate
                accounts that provide false or misleading
                information.
              </li>
            </ul>

            <h4>
              4. Service Provider Obligations
            </h4>

            <ul>
              <li>
                Providers must ensure they have the necessary
                qualifications and legal authorizations to offer
                their services.
              </li>

              <li>
                Providers are responsible for the quality and
                fulfillment of the services they offer.
              </li>

              <li>
                Any agreements between Providers and Users are
                strictly between them; bHive is not a party to these
                agreements.
              </li>
            </ul>

            <h4>
              5. Payment and Fees
            </h4>

            <ul>
              <li>
                Some services on the App may require payment, which
                will be processed through secure third-party payment
                providers.
              </li>

              <li>
                bHive may charge a service fee for transactions
                processed through the App.
              </li>

              <li>
                Users agree to pay all fees associated with their
                requested services.
              </li>
            </ul>

            <h4>
              6. Disclaimers and Limitation of Liability
            </h4>

            <ul>
              <li>
                bHive acts as a marketplace and is not responsible
                for the quality, legality, or safety of the services
                provided.
              </li>

              <li>
                We do not endorse or guarantee the work of any
                Provider.
              </li>

              <li>
                To the fullest extent permitted by law, bHive
                disclaims any liability for damages arising from your
                use of the App.
              </li>
            </ul>

            <h4>
              7. Dispute Resolution
            </h4>

            <ul>
              <li>
                Any disputes between Users and Providers should be
                resolved directly between the parties.
              </li>

              <li>
                bHive may assist in mediation but is not liable for
                any disputes.
              </li>

              <li>
                Disputes with bHive will be resolved through
                arbitration in accordance with the laws of Canada.
              </li>
            </ul>

            <h4>
              8. Termination
            </h4>

            <ul>
              <li>
                We reserve the right to suspend or terminate your
                access to the App at any time for violations of these
                Terms.
              </li>

              <li>
                Users may delete their accounts at any time.
              </li>
            </ul>

            <h4>
              9. Privacy Policy
            </h4>

            <p>
              By using the App, you agree to our Privacy Policy,
              which outlines how we collect, use, and protect your
              data.
            </p>

            <h4>
              10. Changes to Terms
            </h4>

            <p>
              We may update these Terms at any time. Continued use
              of the App after changes means acceptance of the
              revised Terms.
            </p>

            <h4>
              11. Contact Us
            </h4>

            <p>
              If you have any questions or concerns about these
              Terms, please contact us at{" "}
              <strong>
                admin@bhivetechnology.com
              </strong>
              .
            </p>

          </div>

        </section>


        {/* ===================================================
            PRIVACY POLICY
        =================================================== */}

        <section className="about-company-section">

          <div className="about-company-section-heading">

            <span className="about-company-section-number">
              03
            </span>

            <div>
              <h3>
                Privacy Policy
              </h3>

              <p>
                Privacy Policy
              </p>
            </div>

          </div>

          <div className="about-company-content">

            <h4>
              bHyyve Privacy Policy
            </h4>

            <p className="about-company-updated">
              Effective Date: January 1st 2026
            </p>

            <p>
              bHyyve ("bHyyve," "we," "our," or "us") values your
              privacy and is committed to protecting your personal
              information. This Privacy Policy explains how we
              collect, use, disclose, and safeguard information when
              you access or use the bHyyve platform, including our
              website, applications, and related services
              (collectively, the "Services").
            </p>

            <p>
              By using bHyyve, you agree to the practices described
              in this Privacy Policy.
            </p>

            <h4>
              1. Information We Collect
            </h4>

            <h5>
              1.1 Information You Provide
            </h5>

            <p>
              We may collect information that you voluntarily
              provide, including:
            </p>

            <ul>
              <li>
                Name, email address, phone number, and contact
                details
              </li>

              <li>
                Account credentials and profile information
              </li>

              <li>
                Service requests, messages, and communications
              </li>

              <li>
                Business information provided by service providers
              </li>

              <li>
                Payment-related information processed through
                third-party providers
              </li>
            </ul>

            <h5>
              1.2 Information Collected Automatically
            </h5>

            <p>
              When you use the Services, we may automatically
              collect:
            </p>

            <ul>
              <li>
                Device and browser information
              </li>

              <li>
                IP address and approximate location
              </li>

              <li>
                Usage data, pages viewed, and interaction logs
              </li>

              <li>
                Cookies and similar tracking technologies
              </li>
            </ul>

            <h5>
              1.3 Information from Third Parties
            </h5>

            <p>
              We may receive information from third-party partners,
              service providers, or integrations, consistent with
              their privacy policies and applicable law.
            </p>

            <h4>
              2. How We Use Information
            </h4>

            <p>
              We use collected information to:
            </p>

            <ul>
              <li>
                Provide, operate, and improve the Services
              </li>

              <li>
                Connect customers with relevant businesses
              </li>

              <li>
                Facilitate communication between users
              </li>

              <li>
                Personalize user experience and content
              </li>

              <li>
                Process transactions and payments
              </li>

              <li>
                Send service-related communications and updates
              </li>

              <li>
                Detect, prevent, and address fraud, abuse, or
                security issues
              </li>

              <li>
                Comply with legal and regulatory obligations
              </li>
            </ul>

            <h4>
              3. How We Share Information
            </h4>

            <p>
              We may share information as follows:
            </p>

            <ul>
              <li>
                <strong>Between Users:</strong> Information
                necessary to facilitate service connections between
                customers and businesses
              </li>

              <li>
                <strong>Service Providers:</strong> With vendors
                who perform services on our behalf, such as hosting,
                analytics, and payment processing
              </li>

              <li>
                <strong>Legal Obligations:</strong> When required
                to comply with applicable laws, regulations, or
                legal processes
              </li>

              <li>
                <strong>Business Transfers:</strong> In connection
                with a merger, acquisition, or sale of assets
              </li>
            </ul>

            <p>
              We do not sell personal information.
            </p>

            <h4>
              4. Cookies and Tracking Technologies
            </h4>

            <p>
              bHyyve uses cookies and similar technologies to
              enhance functionality, analyze usage, and improve
              performance. You can manage cookie preferences through
              your browser settings, though some features may not
              function properly if cookies are disabled.
            </p>

            <h4>
              5. Data Security
            </h4>

            <p>
              We implement reasonable administrative, technical,
              and physical safeguards to protect personal
              information. However, no method of transmission or
              storage is completely secure, and we cannot guarantee
              absolute security.
            </p>

            <h4>
              6. Data Retention
            </h4>

            <p>
              We retain personal information only for as long as
              necessary to fulfill the purposes outlined in this
              Privacy Policy, unless a longer retention period is
              required or permitted by law.
            </p>

            <h4>
              7. Your Rights and Choices
            </h4>

            <p>
              Depending on your location, you may have rights to:
            </p>

            <ul>
              <li>
                Access, correct, or delete your personal
                information
              </li>

              <li>
                Object to or restrict certain processing activities
              </li>

              <li>
                Withdraw consent where applicable
              </li>
            </ul>

            <p>
              Requests can be submitted through bHyyve support or
              the contact information below.
            </p>

            <h4>
              8. Children's Privacy
            </h4>

            <p>
              bHyyve is not intended for individuals under the age
              of 13. We do not knowingly collect personal
              information from children.
            </p>

            <h4>
              9. Third-Party Links
            </h4>

            <p>
              The Services may contain links to third-party
              websites or services. We are not responsible for the
              privacy practices of those third parties.
            </p>

            <h4>
              10. Changes to This Privacy Policy
            </h4>

            <p>
              We may update this Privacy Policy from time to time.
              Any changes will be posted with an updated effective
              date. Continued use of the Services after changes
              constitutes acceptance of the revised policy.
            </p>

            <h4>
              11. Contact Us
            </h4>

            <p>
              If you have questions or concerns about this Privacy
              Policy or our data practices, please contact us at:
            </p>

            <div className="about-company-contact">

              <strong>
                bHyyve
              </strong>

              <span>
                support@bhyyve.com
              </span>

            </div>

          </div>

        </section>

      </div>

    </div>
  );
};

export default AboutCompany;