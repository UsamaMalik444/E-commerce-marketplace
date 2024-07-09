import Link from "next/link";
import React from "react";

const Features = () => {
  return (
    <div style={{ width: "100%" }}>
      <img style={{ width: "100%" }} src="/FeatureSVG/App.jpeg" />
      <img style={{ width: "100%" }} src="/FeatureSVG/SimpleYet.png" />
      <img style={{ width: "100%" }} src="/FeatureSVG/StoreFront.png" />
      <img style={{ width: "100%" }} src="/FeatureSVG/Partner.png" />
      <img style={{ width: "100%" }} src="/FeatureSVG/Payments.png" />
      <img style={{ width: "100%" }} src="/FeatureSVG/BigSection1.png" />
      <img style={{ width: "100%" }} src="/FeatureSVG/BigSection2.png" />
      <Link href="/register/merchant">
        <a target="_blank" rel="noopener noreferrer">
          <img style={{ width: "100%" }} src="/FeatureSVG/LastSection.png" />
        </a>
      </Link>
    </div>
  );
};

export default Features;
