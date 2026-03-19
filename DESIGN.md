# Advocate / Lawyer Office Management System (MVP) - Design Specification

## **System Architecture**

The system follows a modern decoupled architecture using a RESTful API backend and a single-page application (SPA) frontend.

- **Frontend**: Next.js (React) for its performance, SEO-friendliness, and robust developer ecosystem. It will handle client-side routing, state management (Redux Toolkit or React Context), and UI components (using Tailwind CSS and Shadcn UI).
- **Backend**: Laravel (PHP) as the primary REST API provider. Laravel offers robust security features, built-in ORM (Eloquent), and an excellent ecosystem for building enterprise-grade applications.
- **Database**: MySQL for relational data storage, ensuring data integrity and scalability.
- **Authentication**: Laravel Sanctum for API token-based authentication (SPA-friendly).
- **File Storage**: AWS S3 or compatible cloud storage for documents (contracts, case files, etc.).
- **Infrastructure**: Docker for containerization, ensuring consistent environments across development and production.

---

## **Database Schema**

### **Core Tables**

1.  **Users**
    - `id` (PK)
    - `name`
    - `email` (Unique)
    - `password`
    - `role_id` (FK)
    - `profile_picture`
    - `status` (active, inactive)
    - `timestamps`

2.  **Roles & Permissions**
    - `roles`: `id`, `name`, `slug`
    - `permissions`: `id`, `name`, `slug`
    - `role_permission`: `role_id`, `permission_id`

3.  **Lawyers**
    - `id` (PK)
    - `user_id` (FK to Users)
    - `specialization` (e.g., Criminal, Corporate, Civil)
    - `experience_years`
    - `availability_status` (available, busy, on_leave)
    - `bio`

4.  **Clients**
    - `id` (PK)
    - `user_id` (FK to Users, optional for login)
    - `client_type` (Individual, Corporate)
    - `contact_person` (for corporate)
    - `phone`
    - `address`

5.  **Cases**
    - `id` (PK)
    - `case_number` (Unique)
    - `title`
    - `description`
    - `client_id` (FK)
    - `assigned_lawyer_id` (FK)
    - `opposite_lawyer_name`
    - `status` (Open, Pending, Closed)
    - `court_id` (FK)
    - `filed_date`
    - `closed_date`

6.  **Hearings**
    - `id` (PK)
    - `case_id` (FK)
    - `hearing_date`
    - `judge_name`
    - `notes`
    - `status` (Scheduled, Adjourned, Completed)

7.  **Documents**
    - `id` (PK)
    - `documentable_id` (Polymorphic: Case, Contract, Client)
    - `documentable_type`
    - `file_path`
    - `file_name`
    - `file_type`

8.  **Contracts**
    - `id` (PK)
    - `client_id` (FK)
    - `title`
    - `content`
    - `expiry_date`
    - `status` (Draft, Active, Expired)

9.  **Appointments**
    - `id` (PK)
    - `client_id` (FK)
    - `lawyer_id` (FK)
    - `appointment_date`
    - `start_time`
    - `end_time`
    - `status` (Pending, Confirmed, Cancelled)

10. **Courts**
    - `id` (PK)
    - `name`
    - `category` (High Court, District Court, etc.)
    - `location`

11. **Attendance**
    - `id` (PK)
    - `user_id` (FK)
    - `check_in`
    - `check_out`
    - `date`

12. **Payroll**
    - `id` (PK)
    - `user_id` (FK)
    - `base_salary`
    - `allowances`
    - `deductions`
    - `net_salary`
    - `payment_date`
    - `status` (Paid, Pending)

---

## **Feature Modules**

- **User & Role Management**: RBAC for Admin, Lawyer, and Staff.
- **Lawyer Management**: Detailed profiles, performance metrics, and availability.
- **Case Management**: End-to-end tracking of legal cases, documents, and hearings.
- **Client Management**: 360-degree view of client history and linked cases/contracts.
- **Contract Management**: Lifecycle management from drafting to expiry.
- **Appointment System**: Integrated calendar for scheduling client-lawyer meetings.
- **Attendance & Payroll**: Basic HR functions for firm staff.
- **Cause List**: Automated daily hearing schedules.
- **Reporting**: Analytical dashboards for case status, performance, and financial health.

---

## **API Structure (RESTful)**

- `POST /api/auth/login`: Authenticate users.
- `POST /api/auth/logout`: Revoke tokens.
- `GET /api/cases`: List all cases (filtered by role).
- `POST /api/cases`: Create a new case.
- `GET /api/cases/{id}`: Get case details.
- `GET /api/lawyers`: List firm lawyers.
- `GET /api/clients`: List firm clients.
- `GET /api/appointments`: Fetch appointments.
- `GET /api/cause-list`: Daily hearing schedules.
- `POST /api/documents/upload`: Handle document uploads.

---

## **Dashboard Design**

- **Admin Dashboard**: Summary of total cases, revenue, lawyer performance, and pending tasks. Quick links to manage all modules.
- **Lawyer Dashboard**: My cases, upcoming hearings, today's appointments, and personal tasks.
- **Staff Dashboard**: Client intake, appointment scheduling, and document management.

---

## **Security Best Practices**

1.  **XSS Protection**: Laravel automatically escapes data. Next.js (React) handles this natively.
2.  **SQL Injection Prevention**: Using Laravel's Eloquent ORM and Query Builder with prepared statements.
3.  **CSRF Protection**: Laravel's built-in CSRF protection for web-based forms; Sanctum handles stateful SPA protection.
4.  **Secure Authentication**: Using bcrypt for password hashing and Sanctum for token-based API access.
5.  **Role-Based Access Control (RBAC)**: Fine-grained permissions using Laravel Gates and Policies.
6.  **Data Validation**: Strict request validation on both frontend (Zod) and backend (Laravel Request Validation).
7.  **Encryption**: Sensitive data (if any) encrypted at rest using Laravel's encryption services.
8.  **Cloud Storage Security**: Using S3 signed URLs for secure document access.

---

## **Scalability & Technical Excellence**

- **Modular Backend**: Following SOLID principles and Service-Repository patterns.
- **Responsive Design**: Tailwind CSS ensures the UI works seamlessly on mobile, tablet, and desktop.
- **SEO Optimization**: Next.js Server-Side Rendering (SSR) for public-facing pages.
- **Database Indexing**: Strategic indexing on `case_number`, `user_id`, and `client_id` for fast lookups.
