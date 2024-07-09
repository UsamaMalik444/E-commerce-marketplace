import React, { useState, useEffect } from "react";

export default function CheckingForWallet() {
  const [string, setString] = useState();

  const msg_array = [
    "Just making sure the hamsters are running fast enough in the server room...",
    "Loading... don't worry, it's worth the wait!",
    "Waiting for the internet to catch up to our awesomeness...",
    "Sailing the high seas of the internet, please hold on tight!",
    "The page is loading, take a deep breath and think happy thoughts!",
    "Waiting for the bits and bytes to fall into place...",
    "Sorry for the delay, we're juggling some unicorns to make your experience magical!",
  ];

  useEffect(() => {
    // use math random to pick a random message from the array
    const random = Math.floor(Math.random() * msg_array.length);
    setString(msg_array[random]);
  }, []);

  return (
    <div className="loader">
      <img src="/loader_transparent.gif" />
      <p>{string}</p>
    </div>
  );
}
