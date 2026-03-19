# Advocate Pro - Legal Practice Management System

## Introduction
Advocate Pro is a comprehensive legal practice management solution designed specifically for law firms and independent advocates in Nepal. It streamlines case tracking, client management, and document organization while adhering to the official procedural requirements of the Nepali court system (Supreme Court, High Court, and District Courts).

The application provides a centralized platform for managing all aspects of legal practice, from initial client intake to final case resolution, including the generation of official Case IDs and the management of mandatory legal documents.

---

## Frameworks & Technologies
Advocate Pro is built using a modern, robust technology stack for high performance and security:

- **Frontend**: [Next.js](https://nextjs.org/) (React) with [Tailwind CSS](https://tailwindcss.com/) for a responsive, modern UI.
- **Backend**: [Laravel](https://laravel.com/) (PHP) providing a secure RESTful API.
- **Database**: [MySQL](https://www.mysql.com/) for reliable relational data management.
- **Icons**: [Lucide React](https://lucide.dev/) for intuitive visual navigation.
- **Authentication**: Secure token-based authentication for data protection.

---

## Core Features
1. **Official Nepal Case ID Generation**: Automatically generates Case IDs in the standard format: `Year (BS) - Type Code - Sequence` (e.g., `०८१-WO-०००१`) with official Nepali numerals.
2. **Legal Document Management**: Categorized upload system for mandatory documents like Petitions, Vakalatnama, Evidence, and Court Fee Receipts.
3. **Client & Lawyer Management**: Detailed profiles for individual and corporate clients, and assignment of specialized lawyers to specific cases.
4. **Court & Case Tracking**: Manage cases across different court levels (District, High, Supreme) with real-time status updates (Open, Pending, Closed).
5. **Print-Ready Letterhead**: Professional, standardized letterhead for Case Summaries and reports, ready for official firm use.
6. **User-Friendly Interface**: Modern, grid-based forms and sticky action buttons optimized for all screen sizes and zoom levels.

---

## How It Works: User Instructions

Follow these steps to manage your legal practice effectively:

### Step 1: Dashboard Overview
Upon logging in, you will see the **Dashboard** providing a high-level summary of your active cases, upcoming hearings, and recent activities.

### Step 2: Client Management
1. Navigate to the **Clients** menu.
2. Click **Add Client** to register a new individual or corporate client.
3. Once added, you can click **View Cases** under any client to see their specific legal history.

### Step 3: Case Registration
1. Go to the **Cases** menu and click **New Case**.
2. **Identification**: Enter the **BS Year** (e.g., 081) and select the **Case Type** (e.g., WO - Writ Order, CI - Civil). The system will preview the generated Case ID.
3. **General Info**: Provide a **Case Title** (e.g., John Doe vs. Entity X) and set the **Filed Date**.
4. **Assignments**: Select the **Client**, **Assigned Lawyer**, and the target **Court**.
5. **Save**: Click **Create Case Record**. The system will automatically assign the next sequential number.

### Step 4: Document Uploads
1. From the **Cases** list, click on a specific case or use the **Documents** menu.
2. Click **Add Document**.
3. Select the appropriate **Category** (e.g., Vakalatnama, Court Fee Receipt).
4. Upload the file (PDF, DOCX, or Image) and click **Upload Document**.
5. You can download or delete documents at any time from the case view.

### Step 5: Managing Hearings
1. Navigate to the **Hearings** menu.
2. Schedule new hearings by linking them to existing cases.
3. Record judge names and notes for each session to maintain a complete case history.

### Step 6: Generating Reports
1. Go to a **Client's Case Summary** page.
2. Review the consolidated view of all cases and documents for that client.
3. Click the **Print Report** button to generate a professional document on the firm's official letterhead, suitable for physical filing or sharing with clients.

---

## System Requirements
- **Web Server**: Apache or Nginx
- **PHP**: 8.1 or higher
- **Node.js**: 16.x or higher
- **Database**: MySQL 5.7 or higher
- **Browser**: Modern browser (Chrome, Firefox, Edge, Safari)

---
*Developed for LEGAL SERVICE OFFICE*


## Demo testing
- ADV-2026-TRIAL-KEY (Default Demo Key - **15 Days Trial**)
- New keys can be generated via the Developer Portal for official client activation.

---

## Developed by:
- **Appan Technology Pvt. Ltd.**: Dhanusha, Nagarain-2.
