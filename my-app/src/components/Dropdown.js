import React from 'react';
import Select from 'react-select';

/**
 * Dropdown Component
 * @component
 * 
 * A simple wrapper around 'react-select' providing a reusable dropdown component that provides a consistent, searchable dropdown interface.
 * 
 * This component is primarily used in:
 * - Identity questions (major selection, religion, etc.)
 * - Any form where users need to select from a large list of options
 * 
 * @param {{ value: any, label: string }[]} options - Array of option objects with 'value' and 'label' properties
 *                         Example: [{ value: 'computer-science', label: 'Computer Science' }]
 * @param {(option: { value: any, label: string }) => void} onChange - Callback function triggered when user selects an option
 *                             Receives the selected option object as parameter
 * @param {{ value: any, label: string }} value - Currently selected option object (for controlled component)
 * @param {String} placeholder - Text to display when no option is selected
 * @param {Object} styles - Custom styling object to override default react-select styles
 * 
 * @return {JSX.Element}
 *  - A searchable dropdown component rendered using 'react-select'.
 */


const Dropdown = ({ options, onChange, value, placeholder, styles }) => {
  return (
    <Select
      options={options}               // List of selectable options
      onChange={onChange}             // Handler for when selection changes
      value={value}                   // Currently selected value (controlled component)
      placeholder={placeholder}       // Text shown when nothing is selected
      styles={styles}                 // Custom CSS-in-JS styles for the dropdown
      isSearchable                    // Enables typing to filter options
    />
  );
};

export default Dropdown;
