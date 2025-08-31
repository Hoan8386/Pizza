import React from "react";
import { Title } from "../Title/Title";
const ChickenProducts = (props) => {
  const { title, banner } = props;
  return (
    <>
      <Title title={title} banner={banner} />
    </>
  );
};

export default ChickenProducts;
