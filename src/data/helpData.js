export const helpTopics = [
  {
    id: 100,
    title: "Quick Start Guide",
    description: "Get started quickly with the Integrated Establishments Regulatory Management System.",
    category: "getting-started",
    tags: ["quick start", "introduction", "basics", "getting started"],
    access: [],
    steps: [
      {
        title: "Welcome to IERMS",
        description:
          "This system helps you manage establishments, inspections, and regulatory compliance efficiently. Navigate using the sidebar menu on the left.",
      },
      {
        title: "Access the Help Center",
        description:
          "You can access help anytime by clicking the 'Help Center' button at the bottom of the sidebar, or by pressing F1 or ? on your keyboard.",
      },
      {
        title: "Search and Navigation",
        description:
          "Use the search bar at the top to quickly find establishments or inspections. The dashboard provides an overview of your tasks and statistics.",
      },
      {
        title: "Map View",
        description:
          "Use the Map page to view all establishments geographically. You can click on markers to view details and manage boundary polygons.",
      },
      {
        title: "Role-Based Access",
        description:
          "The system adapts to your user role. Menu items and features available to you depend on your assigned permissions and section.",
      },
    ],
  },
  {
    id: 101,
    title: "Inspector Quick Start",
    description: "Quick guide for inspectors to start conducting inspections.",
    category: "getting-started",
    tags: ["inspector", "quick start", "inspection", "monitoring"],
    access: ["Monitoring Personnel", "Unit Head", "Section Chief", "Division Chief", "admin"],
    steps: [
      {
        title: "View Your Dashboard",
        description:
          "Start from the Dashboard to see pending inspections and your assigned tasks.",
      },
      {
        title: "Create New Inspection",
        description:
          "Go to Inspections page and click 'New Inspection'. Select the establishment(s) you need to inspect.",
      },
      {
        title: "Complete Inspection Form",
        description:
          "Fill out the inspection form with all required information. You can save drafts and come back later.",
      },
      {
        title: "Submit for Review",
        description:
          "Once complete, submit the inspection for review by your supervisor.",
      },
    ],
  },
  {
    id: 102,
    title: "Admin Quick Start",
    description: "Quick guide for administrators to manage the system.",
    category: "getting-started",
    tags: ["admin", "quick start", "management", "system"],
    access: ["admin"],
    steps: [
      {
        title: "User Management",
        description:
          "Navigate to Users page to add, edit, or deactivate user accounts. Assign appropriate roles and sections.",
      },
      {
        title: "System Configuration",
        description:
          "Use System Configuration page to manage law sections, inspection types, and other system settings.",
      },
      {
        title: "Database Backup",
        description:
          "Regularly backup your database from the Database Backup page. You can schedule automatic backups.",
      },
      {
        title: "Monitor Activity",
        description:
          "Check the Dashboard for system-wide statistics and review audit logs for security monitoring.",
      },
    ],
  },
  {
    id: 103,
    title: "Frequently Asked Questions",
    description: "Common questions and answers about using the system.",
    category: "getting-started",
    tags: ["faq", "questions", "help", "common"],
    access: [],
    steps: [
      {
        title: "How do I reset my password?",
        description:
          "Click on your user dropdown in the top-right corner and select 'Change Password'. If you forgot your password, use the 'Forgot Password' link on the login page.",
      },
      {
        title: "Why can't I see certain menu items?",
        description:
          "Menu visibility is role-based. Some features are only available to specific user roles (Admin, Section Chief, etc.). Contact your administrator if you need access.",
      },
      {
        title: "How do I print or export reports?",
        description:
          "Most pages have export options. Look for the export or print button typically located in the top-right area of data tables.",
      },
      {
        title: "Can I use the system on mobile devices?",
        description:
          "Yes! The system is responsive and works on tablets and smartphones. The Help Center automatically becomes full-screen on mobile for better readability.",
      },
      {
        title: "What are keyboard shortcuts?",
        description:
          "Press F1 or ? to open Help Center anytime. Press ESC to close modals. More shortcuts may be available in specific pages.",
      },
    ],
  },
  {
    id: 1,
    title: "How to Add Establishment",
    description: "Step by step guide to add a new establishment.",
    category: "establishment",
    tags: ["add", "establishment", "form"],
    access: ["admin", "Division Chief", "Section Chief", "Unit Head"],
    steps: [
      {
        title: "Open the Establishments Page",
        description:
          "Navigate to the 'Establishments' section from the sidebar.",
        image: "/assets/help/establishment/step1.png",
      },
      {
        title: "Click Add Establishment",
        description:
          "Click the 'Add Establishment' button on the top-right corner.",
        image: "/assets/help/establishment/step2.png",
      },
      {
        title: "Fill the Form",
        description:
          "Enter all the required details like Name, Address, Coordinates, etc.",
        image: "/assets/help/establishment/step3.png",
      },
      {
        title: "Save",
        description: "Click 'Save' to add the establishment to the system.",
        image: "/assets/help/establishment/step4.png",
      },
    ],
  },
  {
    id: 2,
    title: "How to Edit Establishment",
    description: "Guide for modifying existing establishment details.",
    category: "establishment",
    tags: ["edit", "establishment", "update"],
    access: ["admin", "Division Chief", "Section Chief", "Unit Head"],
    steps: [
      {
        title: "Navigate to Establishments",
        description: "Go to the Establishments page from the sidebar.",
      },
      {
        title: "Find the Establishment",
        description:
          "Use the search or browse the list to find the establishment you want to edit.",
      },
      {
        title: "Click Edit Button",
        description: "Click the 'Edit' button next to the establishment name.",
      },
      {
        title: "Update Information",
        description: "Modify the necessary fields and click 'Save' to update.",
      },
    ],
  },
  {
    id: 3,
    title: "How to View and Edit Polygons",
    description:
      "Learn how to view and manage establishment boundary polygons.",
    category: "establishment",
    tags: ["polygon", "map", "boundaries"],
    access: [
      "admin",
      "Division Chief",
      "Section Chief",
      "Unit Head",
      "Monitoring Personnel",
    ],
    steps: [
      {
        title: "Access Polygon View",
        description: "Click the 'Polygon' button next to any establishment.",
      },
      {
        title: "View Existing Polygon",
        description:
          "If a polygon exists, it will be displayed on the map in blue.",
      },
      {
        title: "Edit Polygon",
        description:
          "Click 'Create Polygon' or 'Update Polygon' to enter edit mode.",
      },
      {
        title: "Draw or Modify",
        description:
          "Click on the map to add points, or drag existing points to modify.",
      },
      {
        title: "Save Changes",
        description: "Click 'Save Polygon' to store your changes.",
      },
    ],
  },
  {
    id: 4,
    title: "How to Create Inspections",
    description: "Step by step guide to create new inspections.",
    category: "inspection",
    tags: ["inspection", "create", "wizard"],
    access: [
      "admin",
      "Division Chief",
      "Section Chief",
      "Unit Head",
      "Monitoring Personnel",
    ],
    steps: [
      {
        title: "Navigate to Inspections",
        description: "Go to the Inspections page from the sidebar.",
      },
      {
        title: "Start New Inspection",
        description: "Click the 'New Inspection' button.",
      },
      {
        title: "Select Establishments",
        description: "Choose one or more establishments to inspect.",
      },
      {
        title: "Choose Law Section",
        description: "Select the appropriate law section for the inspection.",
      },
      {
        title: "Complete the Wizard",
        description: "Follow the wizard steps to create the inspection record.",
      },
    ],
  },
  {
    id: 5,
    title: "How to Manage Users",
    description: "Guide for adding, editing, and managing user accounts.",
    category: "user",
    tags: ["user", "management", "admin"],
    access: ["admin"],
    steps: [
      {
        title: "Access Users Page",
        description: "Navigate to 'Users' from the sidebar (admin only).",
      },
      {
        title: "Add New User",
        description:
          "Click 'Add User' button and fill in the required information.",
      },
      {
        title: "Assign Role and Section",
        description: "Select appropriate user role and section.",
      },
      {
        title: "Set User Status",
        description:
          "Activate or deactivate users as needed using the action menu.",
      },
    ],
  },
  {
    id: 6,
    title: "How to Edit Profile",
    description: "Guide for editing user profile and avatar.",
    category: "user",
    tags: ["profile", "edit", "avatar"],
    access: [],
    steps: [
      {
        title: "Go to Profile Settings",
        description: "Click on your avatar and choose 'Profile Settings'.",
        image: "/assets/help/user/profile_step1.png",
      },
      {
        title: "Edit Details",
        description: "Update name, email, and other details.",
        image: "/assets/help/user/profile_step2.png",
      },
      {
        title: "Upload Avatar",
        description: "Click on the avatar to upload a new image.",
        image: "/assets/help/user/profile_step3.png",
      },
      {
        title: "Save Changes",
        description: "Click 'Save' to update your profile.",
      },
    ],
  },
  {
    id: 7,
    title: "How to Change Password",
    description: "Step by step guide to change your account password.",
    category: "user",
    tags: ["password", "security", "account"],
    access: [],
    steps: [
      {
        title: "Access Change Password",
        description:
          "Click on your user dropdown and select 'Change Password'.",
        image: "/assets/help/changepassword/step_1.png",
      },
      {
        title: "Enter Current Password",
        description: "Provide your current password for verification.",
        image: "/assets/help/changepassword/step_2.png",
      },
      {
        title: "Set New Password",
        description: "Enter your new password and confirm it.",
        image: "/assets/help/changepassword/step_3.png",
      },
      {
        title: "Save Changes",
        description: "Click 'Save' to update your password.",
        image: "/assets/help/changepassword/step_4.png",
      },
    ],
  },
  {
    id: 8,
    title: "Understanding User Roles",
    description: "Learn about different user roles and their permissions.",
    category: "user",
    tags: ["roles", "permissions", "access"],
    access: ["admin", "Division Chief", "Section Chief"],
    steps: [
      {
        title: "Legal Unit",
        description:
          "Has access to legal documents and reports. Cannot modify establishments.",
      },
      {
        title: "Division Chief",
        description:
          "Full access to manage establishments, users, and inspections.",
      },
      {
        title: "Section Chief",
        description:
          "Can manage establishments and create inspections within their section.",
      },
      {
        title: "Unit Head",
        description:
          "Can add/edit establishments and create inspections. No user management.",
      },
      {
        title: "Monitoring Personnel",
        description:
          "Can create inspections and edit polygons. Cannot edit establishments.",
      },
    ],
  },
  {
    id: 9,
    title: "How to Use the Interactive Map",
    description: "Navigate and utilize the interactive map to view establishments and their locations.",
    category: "map",
    tags: ["map", "navigation", "location", "view", "geography"],
    access: [],
    steps: [
      {
        title: "View Map Overview",
        description:
          "The map displays all establishments in your area. Each marker represents an establishment location.",
      },
      {
        title: "Navigate the Map",
        description:
          "Use your mouse to pan (click and drag), zoom (scroll wheel), or use the zoom controls in the corner.",
      },
      {
        title: "Click on Markers",
        description:
          "Click any establishment marker to see a popup with basic information and quick action buttons.",
      },
      {
        title: "Filter Establishments",
        description:
          "Use the filter controls to show only specific types of establishments or filter by status.",
      },
      {
        title: "View Establishment Details",
        description:
          "Click 'View Details' in the popup to see complete establishment information.",
      },
    ],
  },
  {
    id: 10,
    title: "Understanding Map Polygons",
    description: "Learn how to view and interpret establishment boundary polygons on the map.",
    category: "map",
    tags: ["map", "polygon", "boundary", "area", "geography"],
    access: [],
    steps: [
      {
        title: "What are Polygons?",
        description:
          "Polygons represent the physical boundaries of an establishment's property. They appear as outlined areas on the map.",
      },
      {
        title: "View Polygon Information",
        description:
          "When you click on a polygon, you'll see the area size, perimeter, and associated establishment details.",
      },
      {
        title: "Polygon Colors",
        description:
          "Different colors may indicate status: Blue for active, Red for violations, Yellow for pending review.",
      },
      {
        title: "Measurements",
        description:
          "The system automatically calculates area (in square meters) and perimeter for each polygon.",
      },
    ],
  },
  {
    id: 11,
    title: "How to Manage Districts",
    description: "Guide for administrators to manage districts and assign inspectors.",
    category: "district",
    tags: ["district", "region", "area", "management", "admin"],
    access: ["admin", "Section Chief", "Unit Head"],
    steps: [
      {
        title: "Access District Management",
        description:
          "Navigate to 'District Management' from the sidebar menu.",
      },
      {
        title: "View Districts",
        description:
          "See all districts with their assigned personnel and establishment counts.",
      },
      {
        title: "Create New District",
        description:
          "Click 'Add District' and provide the district name, code, and geographic boundaries.",
      },
      {
        title: "Assign Inspectors",
        description:
          "Select a district and click 'Assign Inspector' to add personnel to that district.",
      },
      {
        title: "Edit District Boundaries",
        description:
          "Use the map interface to define or modify the geographic boundaries of a district.",
      },
    ],
  },
  {
    id: 12,
    title: "Database Backup and Restore",
    description: "Learn how to backup and restore your system database.",
    category: "system",
    tags: ["database", "backup", "restore", "export", "admin"],
    access: ["admin"],
    steps: [
      {
        title: "Access Backup Page",
        description:
          "Go to 'Database Backup' from the sidebar. This page is only accessible to administrators.",
      },
      {
        title: "Create Manual Backup",
        description:
          "Click 'Create Backup Now' to generate an immediate backup of the entire database.",
      },
      {
        title: "Schedule Automatic Backups",
        description:
          "Set up automatic daily or weekly backups by configuring the backup schedule.",
      },
      {
        title: "Download Backup Files",
        description:
          "Click 'Download' next to any backup to save it to your local computer for safekeeping.",
      },
      {
        title: "Restore from Backup",
        description:
          "Select a backup and click 'Restore'. WARNING: This will replace all current data with the backup data.",
      },
    ],
  },
  {
    id: 13,
    title: "Managing System Notifications",
    description: "How to view, manage, and configure system notifications.",
    category: "notification",
    tags: ["notification", "alert", "message", "settings"],
    access: [],
    steps: [
      {
        title: "View Notifications",
        description:
          "Click the bell icon in the header to see your recent notifications.",
      },
      {
        title: "Mark as Read",
        description:
          "Click on any notification to mark it as read. Read notifications appear less prominent.",
      },
      {
        title: "Filter Notifications",
        description:
          "Use the filter dropdown to show only unread, urgent, or specific types of notifications.",
      },
      {
        title: "Notification Types",
        description:
          "Notifications can be: Info (blue), Warning (yellow), Error (red), or Success (green).",
      },
      {
        title: "Configure Preferences",
        description:
          "Go to Profile Settings to choose which notification types you want to receive.",
      },
    ],
  },
  {
    id: 14,
    title: "System Configuration Guide",
    description: "Complete guide for administrators to configure system settings.",
    category: "system",
    tags: ["system", "config", "settings", "admin", "configuration"],
    access: ["admin"],
    steps: [
      {
        title: "Access Configuration",
        description:
          "Navigate to 'System Configuration' from the sidebar (admin only).",
      },
      {
        title: "Law Sections Management",
        description:
          "Add, edit, or deactivate law sections that are used in inspection forms.",
      },
      {
        title: "Inspection Types",
        description:
          "Configure different inspection types and their associated forms and requirements.",
      },
      {
        title: "System Parameters",
        description:
          "Adjust system-wide settings like session timeout, file upload limits, and email configurations.",
      },
      {
        title: "Security Settings",
        description:
          "Configure password policies, two-factor authentication, and access control rules.",
      },
    ],
  },
  {
    id: 15,
    title: "Dashboard Overview",
    description: "Understanding your dashboard and key metrics displayed.",
    category: "dashboard",
    tags: ["dashboard", "overview", "metrics", "home", "statistics"],
    access: [],
    steps: [
      {
        title: "Dashboard Widgets",
        description:
          "Your dashboard shows key metrics like total establishments, pending inspections, and recent activities.",
      },
      {
        title: "Quick Statistics",
        description:
          "View real-time counts of active establishments, completed inspections, and compliance rates.",
      },
      {
        title: "Recent Activity Feed",
        description:
          "See the latest actions taken in the system, including new inspections and status changes.",
      },
      {
        title: "Customizing Dashboard",
        description:
          "Some widgets can be rearranged or hidden based on your role and preferences.",
      },
      {
        title: "Quick Actions",
        description:
          "Use the quick action buttons to create new inspections or add establishments directly from the dashboard.",
      },
    ],
  },
  {
    id: 16,
    title: "Creating Inspection Reports",
    description: "Step-by-step guide to create and submit inspection reports.",
    category: "inspection",
    tags: ["inspection", "report", "create", "submit", "documentation"],
    access: ["Monitoring Personnel", "Unit Head", "Section Chief", "Division Chief", "admin"],
    steps: [
      {
        title: "Start Inspection Report",
        description:
          "From the Inspections page, click 'New Inspection' and select the establishment.",
      },
      {
        title: "Fill Inspection Form",
        description:
          "Complete all required fields including date, inspector name, and inspection type.",
      },
      {
        title: "Document Findings",
        description:
          "Record observations, violations, and compliance items. Add photos if available.",
      },
      {
        title: "Add Recommendations",
        description:
          "Provide recommendations for corrective actions if violations are found.",
      },
      {
        title: "Review and Submit",
        description:
          "Review all information for accuracy, then click 'Submit' to finalize the inspection report.",
      },
      {
        title: "Track Status",
        description:
          "Monitor the report status as it moves through review and approval workflows.",
      },
    ],
  },
  {
    id: 17,
    title: "Searching and Filtering",
    description: "Learn how to efficiently search and filter establishments and inspections.",
    category: "general",
    tags: ["search", "filter", "find", "query"],
    access: [],
    steps: [
      {
        title: "Use the Search Bar",
        description:
          "Type in the search bar at the top to quickly find establishments by name, address, or ID.",
      },
      {
        title: "Advanced Filters",
        description:
          "Click the filter icon to access advanced filtering options like date range, status, and category.",
      },
      {
        title: "Save Filters",
        description:
          "Save frequently used filter combinations for quick access in the future.",
      },
      {
        title: "Export Results",
        description:
          "After filtering, use the export button to download results as CSV or PDF.",
      },
    ],
  },
  {
    id: 18,
    title: "Billing and Legal Records",
    description: "How to access and manage billing records and legal documents.",
    category: "legal",
    tags: ["billing", "legal", "payment", "records", "documents"],
    access: ["Legal Unit", "admin"],
    steps: [
      {
        title: "Access Billing Page",
        description:
          "Navigate to 'Billing Records' from the sidebar (Legal Unit access required).",
      },
      {
        title: "View Payment History",
        description:
          "See all payment records associated with establishments, including fines and fees.",
      },
      {
        title: "Generate Invoices",
        description:
          "Create invoices for establishments based on violations or permit fees.",
      },
      {
        title: "Track Payment Status",
        description:
          "Monitor which invoices are paid, pending, or overdue.",
      },
      {
        title: "Export Legal Reports",
        description:
          "Generate comprehensive legal reports for court proceedings or official records.",
      },
    ],
  },
];
