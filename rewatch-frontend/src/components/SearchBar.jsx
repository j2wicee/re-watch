import React from "react";

/*
  SearchBar props:
  - value: the current text inside the input (from parent state)
  - onChange: a function to call whenever the user types
*/
function SearchBar({ value, onChange }) {
  // When the input changes, we call onChange with the new value
  const handleInputChange = (event) => {
    onChange(event.target.value); // event.target.value is the latest text
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}
    >
      {/*
        The input is "controlled" because its value comes from props (React state in the parent).
        - value={value} means the input shows whatever value the parent gives it.
        - onChange={handleInputChange} tells React to update the parent when the user types.
      */}
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Search anime..."
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "12px 14px",
          borderRadius: 8,
          border: "1px solid #3a3a50",
          outline: "none",
          backgroundColor: "#1c1c2b",
          color: "#f0f0ff",
        }}
      />
    </div>
  );
}

export default SearchBar;
