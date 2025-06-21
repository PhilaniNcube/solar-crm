# Solar CRM Route Structure

This document outlines the complete route structure for the Solar CRM application, organized by feature areas.

## 🏠 Public Routes

### Home Page
- **Route:** `/`
- **Purpose:** Landing page with authentication
- **Access:** Public
- **Features:** Sign-in/sign-up buttons, dashboard links for authenticated users

### Public Quote Viewer
- **Route:** `/quote/[publicQuoteId]`
- **Purpose:** Customer-facing quote presentation
- **Access:** Public (no authentication required)
- **Features:** Quote details, pricing, acceptance buttons

## 🔐 Protected Routes (Dashboard)

All routes under `/(dashboard)/[orgSlug]/` require:
1. **User Authentication** via Clerk
2. **Organization Membership** - user must be a member of the requested organization

### 1. Main Dashboard
- **Route:** `/[orgSlug]/dashboard`
- **Purpose:** Command center with key metrics and quick actions
- **Features:**
  - Key performance metrics (active projects, new leads, revenue)
  - Recent activity feed
  - Upcoming tasks and appointments
  - Quick action buttons for common tasks

### 2. Leads & Sales Pipeline

#### Leads Overview
- **Route:** `/[orgSlug]/leads`
- **Purpose:** Kanban board view of sales pipeline
- **Features:**
  - Drag-and-drop lead management
  - Status columns (New, Contacted, Assessment, Quoting)
  - Lead summary table with filters

#### New Lead Form
- **Route:** `/[orgSlug]/leads/new`
- **Purpose:** Form to manually create new leads
- **Features:**
  - Customer information capture
  - Lead source tracking
  - Initial notes and categorization

#### Lead Details
- **Route:** `/[orgSlug]/leads/[leadId]`
- **Purpose:** Comprehensive lead management
- **Features:**
  - Contact information and communication history
  - Status tracking and notes
  - Quick actions (call, email, schedule)
  - Lead-to-quote conversion

### 3. Quotes & Proposals

#### Quotes Overview
- **Route:** `/[orgSlug]/quotes`
- **Purpose:** List and manage all system proposals
- **Features:**
  - Filter by status (Draft, Sent, Accepted, Rejected)
  - Quote summary with pricing
  - Bulk actions and status updates

#### Quote Editor/Designer
- **Route:** `/[orgSlug]/quotes/[quoteId]`
- **Purpose:** System design and quote creation
- **Features:**
  - Equipment selection and configuration
  - Pricing calculations
  - Proposal generation and sending
  - Version control and revisions

### 4. Project Management

#### Projects Overview
- **Route:** `/[orgSlug]/projects`
- **Purpose:** Track all active installations
- **Features:**
  - Project status dashboard
  - Timeline and milestone tracking
  - Resource allocation overview

#### Project Details Hub
- **Route:** `/[orgSlug]/projects/[projectId]`
- **Purpose:** Central project management interface
- **Features:**
  - Project overview and status
  - Navigation to project sub-sections
  - Key milestones and deadlines

#### Project Tasks
- **Route:** `/[orgSlug]/projects/[projectId]/tasks`
- **Purpose:** Task checklist and workflow management
- **Features:**
  - Task assignment and completion tracking
  - Due date management
  - Team collaboration tools

#### Project Documents
- **Route:** `/[orgSlug]/projects/[projectId]/documents`
- **Purpose:** Document management and file storage
- **Features:**
  - Contract and permit storage
  - Photo documentation
  - Version control for documents

#### System Details
- **Route:** `/[orgSlug]/projects/[projectId]/system`
- **Purpose:** Installed system specifications
- **Features:**
  - Equipment serial number tracking
  - Warranty information
  - Performance monitoring setup

### 5. Customer Management

#### Customer Directory
- **Route:** `/[orgSlug]/customers`
- **Purpose:** Comprehensive customer database
- **Features:**
  - Search and filtering capabilities
  - Customer type categorization (residential/business)
  - Contact management and communication history

#### New Customer Form
- **Route:** `/[orgSlug]/customers/new`
- **Purpose:** Create new customer records
- **Features:**
  - Contact information capture
  - Property details and preferences
  - Integration with lead and quote systems

#### Customer 360 View
- **Route:** `/[orgSlug]/customers/[customerId]`
- **Purpose:** Complete customer relationship overview
- **Features:**
  - Contact details and communication history
  - Associated leads, quotes, and projects
  - Customer lifecycle tracking
  - Payment and billing history

### 6. Schedule Management

#### Global Calendar
- **Route:** `/[orgSlug]/schedule`
- **Purpose:** Unified calendar for all organization activities
- **Features:**
  - Site assessment appointments
  - Installation schedules
  - Inspection and milestone dates
  - Team availability and resource planning

### 7. Settings & Configuration

#### Settings Hub
- **Route:** `/[orgSlug]/settings`
- **Purpose:** Central configuration management
- **Features:**
  - Quick access to all settings areas
  - System preferences overview
  - Recent configuration changes

#### Organization Profile
- **Route:** `/[orgSlug]/settings/profile`
- **Purpose:** Company information and branding
- **Features:**
  - Company details (name, logo, address)
  - Branding customization for quotes
  - Contact information management

#### Team Management
- **Route:** `/[orgSlug]/settings/team`
- **Purpose:** User and permission management
- **Features:**
  - Clerk OrganizationProfile component
  - Team member invitations
  - Role and permission assignment
  - Access control management

#### Equipment Catalog
- **Route:** `/[orgSlug]/settings/equipment`
- **Purpose:** Product and inventory management
- **Features:**
  - Solar panel, inverter, and component catalog
  - Pricing and specification management
  - Vendor and supplier information
  - Product availability tracking

#### Billing Management
- **Route:** `/[orgSlug]/settings/billing`
- **Purpose:** Subscription and payment management
- **Features:**
  - CRM subscription management
  - Payment method configuration
  - Usage tracking and limits
  - Billing history and invoices

#### Integrations
- **Route:** `/[orgSlug]/settings/integrations`
- **Purpose:** Third-party service connections
- **Features:**
  - API key management
  - Google Calendar integration
  - Accounting software connections
  - Inverter monitoring setup

## 🔒 Security & Access Control

### Authentication Layers
1. **Middleware Protection:** All dashboard routes protected at the middleware level
2. **Layout Protection:** Server-side auth checks in dashboard layout
3. **Organization Access:** Automatic verification of organization membership
4. **Route-Level Checks:** Individual page authentication validation

### Permission Levels
- **Public Access:** Home page and public quote viewer
- **Authenticated User:** Access to dashboard and basic features
- **Organization Member:** Full access to organization-specific data
- **Admin/Owner:** Enhanced permissions for settings and team management

## 📊 Data Flow & Integration

### Clerk Integration
- **User Authentication:** Seamless sign-in/sign-up flow
- **Organization Management:** Built-in team and permission system
- **Session Management:** Automatic session handling and refresh

### Convex Database
- **Audit Trails:** All database operations include userId for tracking
- **Organization Isolation:** Data automatically scoped to organization
- **Real-time Updates:** Live data synchronization across users

### Route Protection
- **Middleware-First:** Performance-optimized route protection
- **Server-Side Validation:** Reliable access control
- **Graceful Fallbacks:** Proper error handling and redirects

This route structure provides a comprehensive Solar CRM system with proper security, scalability, and user experience considerations.
