<!-- f1a8ece2-3d6c-4712-b331-9eea771abc91 91b47ba2-4a8a-4b51-a43a-d02fea72c0b2 -->
# Help Editor Save and Cancel Buttons Implementation

## Overview
Enhance the Help Editor to add Save/Cancel buttons for topic editing and create a modal for category management.

## Changes Required

### 1. Topic Management (`src/components/help/HelpEditor.jsx`)

**Update `addTopic()` function:**
- Set `selectedTopicId` to automatically open the new topic in the editor panel
- Track that this is a new topic being edited

**Add state for tracking edits:**
- Add `editingTopicData` state to store the topic being edited (for cancel functionality)
- Add `isNewTopic` flag to track if the current topic is newly created

**Add Save/Cancel buttons to topic editor:**
- Place buttons in the topic editor header (near the delete button)
- Save button: Apply changes and exit edit mode
- Cancel button: Discard changes and either remove new topics or revert to original state
- Show buttons only when a topic is selected and being edited

**Implementation details:**
- When editing a topic, store the original state before changes
- On Cancel: 
  - If new topic: Reset to default values but keep in list
  - If existing topic: Revert to original state
- On Save: 
  - Apply changes to local state
  - Immediately call `handleSave()` to save to server
  - Exit edit mode after successful save
- Changes are still applied to local state immediately (for real-time preview)

### 2. Category Modal (`src/components/help/HelpEditor.jsx`)

**Update `addCategory()` function:**
- Instead of adding directly to list, open a modal
- Store the new category data in modal state

**Create Category Edit Modal:**
- Modal component with form fields:
  - Category Name (required)
  - Category Key (auto-generated from name, editable)
- Validation:
  - Category name required
  - Category key must be unique
  - Key format validation (lowercase, hyphens, alphanumeric)
- Buttons:
  - Save: Add category to list and close modal
  - Cancel: Close modal without saving

**Modal implementation:**
- Use similar pattern to existing modals (fixed overlay, centered content)
- Include form validation with error messages
- Auto-generate key from name but allow manual editing
- Show confirmation if canceling with unsaved changes

### 3. File Changes

**`src/components/help/HelpEditor.jsx`:**
- Add state for `editingTopicData`, `isNewTopic`, `categoryModalOpen`, `editingCategoryData`
- Update `addTopic()` to set `selectedTopicId` and `isNewTopic`
- Add Save/Cancel handlers for topics
- Update `addCategory()` to open modal instead of adding directly
- Create CategoryModal component within the file
- Add Save/Cancel buttons to topic editor UI