import { createElement, useState, useEffect, memo } from "react";

import { CountdownTimerComponent } from "./components/CountdownTimerComponent";
import "./ui/CountdownTimer.css";

// Helper function to compare Mendix-like objects (status and value)
const areMendixPropsEqual = (prev, next) => {
  if (!prev || !next) return prev === next;
  if (prev.status !== next.status) return false;

  if (prev.value instanceof Date && next.value instanceof Date) {
    return prev.value.getTime() === next.value.getTime();
  }
  // For numbers, strings, etc.
  return prev.value === next.value;
};

// Custom comparison function for React.memo
const areCountdownPropsEqual = (prevProps, nextProps) => {

  if (prevProps.timeDuration.status !== "available" || prevProps.currentValue.status !== "available" || prevProps.startTime.status !== "available"
   || prevProps.currentDateTime.status !== "available") {
    return false;
  } 
  // Compare each Mendix-like prop using your helper
  const currentDateTimeChanged = !areMendixPropsEqual(prevProps.currentDateTime, nextProps.currentDateTime);
  // If true, it means a prop has changed, so return false (meaning re-render)
  if (currentDateTimeChanged) {
    return false;
  }
  // If no relevant prop has changed, return true (meaning DO NOT re-render)
  return true;
};


export const CountdownTimer = memo(function CountdownTimer({
  timeDuration,
  currentValue,
  startTime,
  onPauseClickAction,
  currentDateTime
}) {
  const [time, setTime] = useState(timeDuration);
  const [c, setC] = useState(currentValue);
  const [timeStart, setTimeStart] = useState(startTime);
  const [date, setDate] = useState(currentDateTime);

  useEffect(() => {
    // This will only run if timeDuration (prop) changes AND React.memo allowed a re-render
    setTime(timeDuration);
  }, [timeDuration]);

  useEffect(() => {
    setTimeStart(startTime);
  }, [startTime]);

  useEffect(() => {
    setC(currentValue);
  }, [currentValue]);

  useEffect(() => {
    setDate(currentDateTime);
  }, [currentDateTime]);

  if (time.status !== "available" || c.status !== "available" || timeStart.status !== "available" || date.status !== "available") {
    return <div>Loading...</div>;
  } else {
    return (
      <CountdownTimerComponent
        timeDuration={time.value.toNumber()}
        currentValue={c}
        startTime={timeStart.value.toNumber()}
        onPauseClickAction={onPauseClickAction}
        currentDateTime={date.value}
      />
    );
  }
}, areCountdownPropsEqual); // <-- Pass the custom comparison function here