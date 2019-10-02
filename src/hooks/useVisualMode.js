import React, { useState } from "react";

const useVisualMode = initial => {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => {
    setMode(newMode);
    if (replace) {
      setHistory(([, ...restHistory]) => [newMode, ...restHistory]);
    } else {
      setHistory(history => [newMode, ...history]);
    }
  };

  const back = () => {
    if (history.length > 1) {
      const [, ...restHistory] = history;
      setMode(restHistory[0]);
      setHistory(restHistory);
    }
  };

  return { mode, transition, back };
};

export { useVisualMode };
