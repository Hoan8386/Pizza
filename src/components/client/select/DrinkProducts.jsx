import React from "react";
import { Title } from "../Title/Title";
const DrinkProducts = (props) => {
  const { title, banner } = props;
  return (
    <>
      <Title title={title} banner={banner} />
    </>
  );
};

export default DrinkProducts;
