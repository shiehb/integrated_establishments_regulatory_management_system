export const helpTopics = [
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
];
