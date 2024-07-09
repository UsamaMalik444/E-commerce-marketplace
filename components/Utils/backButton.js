import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const BackButton = (req) => {
  // this will be a back button that will useRouter to go back to the previous page
  // router will also have query to pass state

  const router = useRouter();
  const { pathname, query } = req;
  // turn to 'pathname?query'
  const string = pathname + "?" + query;
  console.log("incoming", pathname, query);

  console.log("lollll", localStorage.getItem("previousState"));

  return (
    <div>
      <button
        onClick={() => {
          console.log("clicked back button", pathname, query);
          router.push({
            pathname: pathname,
            query: query,
          });
          // router.push(string)
        }}
      >
        Back
      </button>
    </div>
  );
};

export default BackButton;
