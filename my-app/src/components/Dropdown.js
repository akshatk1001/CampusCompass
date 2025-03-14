import React from 'react';
import Select from 'react-select';

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
