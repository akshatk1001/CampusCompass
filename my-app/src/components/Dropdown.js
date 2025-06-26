import React from 'react';
import Select from 'react-select';

/**
 * A simple wrapper around 'react-select' that allows for customization
 * and standardization accross various pages.  
 * @component
 * 
 * @param {object} props
 * 
 * @param {{label: string, value: any }[]}} props.options
 *  - options for selection in the dropdown in the form {label, value}
 * e.g. [{label: 'Male', value: 'man men'}, {label: 'Female', value: 'woman women'}, {label: 'Non-binary', value: 'other'}]
 * @param {(option: {label: string, value: any}) => void} props.onChange
 *  - Action taken after an option is selected
 * @param {{label: string, value: any}} props.value
 *  - Current option (from props.options) selected
 * @param {string} props.placeholder
 *  - Dropdown text placeholder for if no option is currently selected (e.g "Select An Option")
 * @param {*} props.styles (NOTE: not sure what style type is so left as *)
 *  - Optional custom styling of dropdown component (e.g. colors, size, hoverability)
 * 
 * @return {JSX.Element}
 *  - A searchable dropdown component rendered using 'react-select'.
 * 
 */
const Dropdown = ({ options, onChange, value, placeholder, styles }) => {
  return (
    <Select
      options={options}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      styles={styles}
      isSearchable
    />
  );
};

export default Dropdown;
