import React from "react";

const Heading = ({ name, title }) => {
  return (
    <div className="heading">
      <h4>{name}</h4>
      <h1>{title}</h1>
    </div>
  );
};

export default Heading;
