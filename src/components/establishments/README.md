# Establishments Component Documentation

## Overview

The Establishments module provides components for managing a list of establishments. It includes functionalities to add, edit, and display establishments in a structured format.

## Components

### 1. EstablishmentList

- **File:** `EstablishmentList.jsx`
- **Description:** Displays a list of establishments in a table format. It allows users to add new establishments, edit existing ones, and toggle their status.
- **Features:**
  - Table view of establishments
  - Add, edit, and toggle status functionalities
  - Input fields for establishment details are in uppercase, except for dropdown options.

### 2. AddEstablishment

- **File:** `AddEstablishment.jsx`
- **Description:** Provides a form for adding a new establishment.
- **Fields:**
  - Name
  - Nature of Business
  - Year Established
  - Address:
    - Province
    - City
    - Barangay
    - Street/Building
    - Postal Code
  - Coordinates:
    - Latitude
    - Longitude
- **Note:** All input fields are in uppercase.

### 3. EditEstablishment

- **File:** `EditEstablishment.jsx`
- **Description:** Provides a form for editing an existing establishment's details.
- **Fields:** Same as `AddEstablishment`.
- **Note:** All input fields are in uppercase.

## Usage Instructions

1. Import the desired component into your application.
2. Use the component within your JSX as needed.
3. Ensure to handle state management for the list of establishments appropriately.

## Example

```jsx
import EstablishmentList from './EstablishmentList';
import AddEstablishment from './AddEstablishment';
import EditEstablishment from './EditEstablishment';

// Usage in a parent component
function App() {
  return (
    <div>
      <EstablishmentList />
      {/* AddEstablishment and EditEstablishment can be used conditionally based on user actions */}
    </div>
  );
}
```

## Conclusion

This module provides a comprehensive solution for managing establishments, ensuring that all relevant details are captured and displayed effectively.