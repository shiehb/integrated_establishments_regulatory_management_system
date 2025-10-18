<!-- 71ffa03c-3d50-4944-bf11-cbed392b7042 9baf319d-9ce4-4c79-84bc-cdad0d60fa93 -->
# Move Validation Errors to Right Sidebar

## Current Implementation

Currently, the ValidationSummary appears at the top of the form content area (lines 1811-1817 in InspectionForm.jsx), showing validation errors in a banner format above all form sections.

## Desired Implementation

Display the ValidationSummary in a right sidebar panel, similar to the InspectionPolygonMap that appears when the map is open. The validation errors sidebar should be:

- Fixed on the right side
- Scrollable independently
- Only visible when submit action is attempted (not during normal form editing)
- Can optionally be closeable

## Changes Required

### 1. Update `InspectionForm.jsx` (lines 1799-1817)

**Current structure:**

```javascript
rightSidebar={
  isMapPanelOpen && fullInspectionData && (
    <InspectionPolygonMap />
  )
}
<div className="w-full bg-gray-50">
  {hasFormChanges && Object.keys(errors).length > 0 && (
    <ValidationSummary />
  )}
```

**New structure:**

```javascript
rightSidebar={
  // Priority 1: Show validation errors (only when submit is attempted)
  hasFormChanges && Object.keys(errors).length > 0 && (buttonVisibility.showSubmitButton || buttonVisibility.showSubmitForReviewButton || buttonVisibility.showCompleteButton) ? (
    <ValidationSummary 
      errors={errors} 
      onScrollToSection={scrollToSection}
    />
  ) 
  // Priority 2: Show map (reference only)
  : isMapPanelOpen && fullInspectionData ? (
    <InspectionPolygonMap />
  ) 
  : null
}
<div className="w-full bg-gray-50">
  {/* Remove ValidationSummary from here */}
```

### 2. Update `ValidationSummary.jsx`

Add styling to make it work as a right sidebar panel:

- Add container styling for fixed right panel
- Add close button (optional)
- Adjust layout for vertical sidebar display
- Make it scrollable
- Match the styling/UX of the map panel

**Styling changes:**

- Wrap content in a sidebar container with fixed width
- Add proper padding and height
- Use sticky positioning or fixed height with scroll
- Add close button in header

### 3. Alternative: Show Both Map and Validation

If you want both to be visible:

- Stack them vertically in the right sidebar
- Map on top, validation errors below
- Both scrollable in their respective areas

## Files to Modify

1. `src/components/inspection-form/InspectionForm.jsx` - Move ValidationSummary to rightSidebar prop
2. `src/components/inspection-form/ValidationSummary.jsx` - Add sidebar styling and close button

## Implementation Decision: Submit-Action Priority-Based Sidebar

**Validation errors only show during submit actions:**

- Validation errors are shown ONLY when user can submit (submit buttons visible)
- Map is shown when no errors exist and no submit action (reference/optional)
- Validation sidebar is NOT closeable (must fix errors)
- Clean interface when no submit action and no map

**Priority Logic:**

```
Priority 1: Validation Errors (when hasFormChanges && errors exist && submit buttons visible)
Priority 2: Map (when isMapPanelOpen && no submit action)
Priority 3: No Sidebar (clean interface)
```

**Submit Button Conditions:**
- `buttonVisibility.showSubmitButton` - Basic submit button
- `buttonVisibility.showSubmitForReviewButton` - Submit for review button  
- `buttonVisibility.showCompleteButton` - Complete/submit button

**Benefits:**
- Only shows during submission attempts - not while user is just filling out the form
- Clean interface while editing - no distracting error sidebar during normal form completion
- Critical errors visible when needed - appears exactly when user tries to submit
- Map still accessible when no errors and no submit action
