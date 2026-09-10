# FutureSelector — EdTech Discovery & Admission Platform 🎓

FutureSelector is a comprehensive, production-ready EdTech SaaS platform designed to streamline the discovery, comparison, and admission processes for JEE/NEET aspirants. It brings transparency to coaching institute selections while providing an end-to-end admission pipeline, counseling workflows, and robust lead-tracking for institutes.

> **Status:** Under Active Development 🚧

## 🌟 Key Features

*   **Multi-Portal Ecosystem:** Isolated, secure dashboards for **Students**, **Institutes**, **Counsellors**, and **Super Admins** tailored with Role-Based Access Control (RBAC).
*   **Transparent Institute Comparison:** Advanced filtering and side-by-side comparison of coaching institutes based on fees, batch size, faculty, and verified past results.
*   **Intelligent Lead Tracking:** A sophisticated lead management engine that tracks the lifecycle of an enquiry—from the first contact to confirmed admission.
*   **Automated Revenue & Commission Dashboard:** Real-time revenue tracking for institutes and automated commission management.
*   **Seamless Payments Integration:** Secure, end-to-end financial transactions implemented using the **Razorpay** payment gateway for counseling fees and premium services.
*   **Referral & Reward System:** A robust referral tracking system that issues rewards (like branded merchandise) upon successful admission confirmations.
*   **Admin Verification Workflow:** Strict verification protocols ensuring that only validated data (fees, faculty, results) is presented to the students.

## 🛠️ Tech Stack & Architecture

This platform is built using a modern, scalable architecture prioritizing speed, security, and developer experience.

### **Frontend**
*   **Library:** React.js
*   **Styling:** Tailwind CSS
*   **State Management:** Redux Toolkit / Context API
*   **Routing:** React Router DOM

### **Backend**
*   **Runtime Environment:** Node.js
*   **Framework:** Express.js
*   **Authentication:** JSON Web Tokens (JWT), OAuth (Google/GitHub), bcrypt
*   **API Design:** RESTful Architecture principles

### **Database & Infrastructure**
*   **Database:** MongoDB (using Mongoose for schema validation)
*   **Optimization:** Aggregation pipelines and indexing to reduce query latency by up to 40%
*   **Storage:** AWS S3 / Cloudinary (for documents and institute assets)

### **Integrations**
*   **Payment Gateway:** Razorpay
*   **Real-time Communication:** Socket.io & WebRTC (for live counseling chats/video)
*   **Email Services:** SendGrid / Nodemailer (for status updates and invoices)

## 🗄️ Database Schema Overview

The relational structure encompasses the following core entities:
*   **Users:** (Students, Admins, Institute Managers, Counsellors)
*   **Institutes:** (Details, Verification Status, Batches, Faculty, Fees)
*   **Enquiries & Admissions:** (Status tracking from `NEW` to `ADMISSION CONFIRMED`)
*   **Payments & Transactions:** (Audit logs for Razorpay webhooks)
*   **Referrals:** (Tracking unique referral codes and reward dispatch states)

## 🔒 Security Practices

*   Encrypted password storage using **Bcrypt**.
*   **CORS** configuration and rate limiting to prevent DDoS attacks.
*   Strict protected routes and middleware guards ensuring data privacy (Institutes can only view leads assigned to them).
*   No storage of sensitive financial credentials (utilizing secure checkout pages).

---
*Designed & Developed by [Anuj Goyal](https://www.linkedin.com/in/anuj-goyal25)*
