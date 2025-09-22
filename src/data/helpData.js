export const helpTopics = [
  {
    id: 1,
    title: "How to Add Establishment",
    description: "Step by step guide to add a new establishment.",
    category: "establishment",
    tags: ["add", "establishment", "form"],
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
    title: "How to Edit Profile",
    description: "Guide for editing user profile and avatar.",
    category: "user",
    tags: ["profile", "edit", "avatar"],
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
    id: 3,
    title: "Manage User Roles",
    description: "How to assign and update user roles.",
    category: "user",
    tags: ["roles", "user", "permissions"],
    steps: [
      {
        title: "Navigate to Users",
        description: "Go to the Admin Panel and click 'Users'.",
      },
      {
        title: "Select a User",
        description: "Find the user you want to update and click 'Edit'.",
      },
      {
        title: "Assign Role",
        description:
          "Choose a role (Admin, Inspector, Legal, etc.) from the dropdown.",
      },
      {
        title: "Save",
        description: "Click 'Save' to apply the changes.",
      },
    ],
  },
  {
    id: 4,
    title: "System Settings",
    description: "Configuration guide for system administrators.",
    category: "system",
    tags: ["settings", "system", "config"],
    steps: [
      {
        title: "Go to System Settings",
        description: "Navigate to Settings > System.",
        image: "/assets/help/system/settings_step1.png",
      },
      {
        title: "Update Configurations",
        description: "Change timezone, email server, or security options.",
      },
      {
        title: "Save",
        description: "Click 'Save' to apply updates.",
      },
    ],
  },
];
