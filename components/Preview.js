import React from "react";
import Lottie from "react-lottie";
// import animationData from "/preview.json";

function Preview() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    // animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return <Lottie options={defaultOptions} height={400} width={400} />;
}

export default Preview;
