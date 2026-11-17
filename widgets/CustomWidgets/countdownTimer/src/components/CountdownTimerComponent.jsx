import { createElement, useState, useEffect } from "react";
import { CountdownCircleTimer } from 'react-countdown-circle-timer'

const renderTime = (dimension, time, timeDuration, allocatedTime, isOvershoot) => {
  const duration = Math.round(allocatedTime);
 
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = Math.trunc((time % 60)).toString().padStart(2, '0');;
 
  //Only used for display.
  const formatedHours = Math.floor(duration / 3600).toString().padStart(2, '0');
  const formatedminutes = Math.floor((duration % 3600) / 60).toString().padStart(2, '0');

 
  return (
      <div className="time-wrapper">
      <div className="time" style={{ bottom: '90%' }}>
        <div className="task-name">Task Time</div>
        {isOvershoot?(<div className="time-count time-count-overshoot">+ {minutes}:{seconds} min</div>):(<div className="time-count">{minutes}:{seconds} min</div>)}
        {((timeDuration != 0 && allocatedTime != 0) || (timeDuration == 0 && allocatedTime != 0)) ? (<div className="task-name">/{formatedHours}:{formatedminutes} h</div>) : null}
      </div>
    </div>
  );
};



export function CountdownTimerComponent({ timeDuration, currentValue, startTime, onPauseClickAction, currentDateTime }) {

  const [isPlaying, setIsPlaying] = useState(true);
  const [time, setTime] = useState(timeDuration);
  const [timeStart, setTimeStart] = useState(startTime);
  const [key, setKey] = useState(0);
  const [xx, setXx] = useState(timeDuration);
  const [date, setDate] = useState(currentDateTime);
  const [defaultTime, setDefaultTime] = useState(Number.MAX_SAFE_INTEGER);
  const [allocatedTime, setAllocatedTime] = useState(timeDuration);
  const [countUpMode, setCountUpMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTime(timeDuration)
    setAllocatedTime(timeDuration)
  }, [timeDuration]);

  useEffect(() => {
    setTimeStart(startTime)
  }, [startTime]);

  useEffect(() => {
    setDate(currentDateTime)
    setKey(key + 1)
    setIsPlaying(true)
    setIsLoading(false);
    if (startTime > timeDuration)  // In case of overshoot set the CountUpMode= true
      setCountUpMode(true)
    else 
      setCountUpMode(false)
  }, [currentDateTime]);

  const handleComplete = () => {
    setCountUpMode(true);
    return { shouldRepeat: false }; // prevent auto-repeat
  };

  const PauseIcon = ({ className = "timer-icon", color = 'currentColor' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
      <path fill="none" d="M0 0h24v24H0z" />
       
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z"
        fill="transparent"  // Make fill transparent
        stroke={color}     // Add stroke color
        strokeWidth="1.5"  // Add stroke width
      />
    </svg>
  );

  const StartIcon = ({ className = "timer-icon", color = 'currentColor' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className}>
      
      <path fill="none" d="M0 0h24v24H0z" />
        <path d="M8 5v14l11-7z"
        fill="transparent"  // Make fill transparent
        stroke={color}     // Add stroke color
        strokeWidth="1.5"  // Add stroke width

      />
    </svg>
  );

  const onPauseClickHandler = () => {
    if (isPlaying) {
      if (onPauseClickAction && onPauseClickAction.canExecute) {
        onPauseClickAction.execute();
      }
    }
    setIsPlaying((prev) => !prev);
  }

  if (time == 0) {    // When AllocationTime = 0
    return (
      <div className="timer-container">
        <CountdownCircleTimer
          key={key}
          isPlaying={isPlaying}
          duration={defaultTime}
          trailColor={isPlaying ? "#0F7EA5" :"#888888"}
          colors={isPlaying ? "#0F7EA5" :"#888888"}
          size={40}
          initialRemainingTime={defaultTime - timeStart}
          strokeWidth={5}
          strokeLinecap="square"
          onUpdate={(elapsedTime) => {
            // Update Mendix value on timer update
            if (currentValue?.status === "available") {
              const r = parseFloat(elapsedTime);
              const d = parseFloat(defaultTime);
              currentValue.setTextValue("" + ((d-r)/86400).toFixed(8));
            }
          }}
        >

          {({ elapsedTime }) => {

            return (
              <span>
                <button onClick={onPauseClickHandler} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} className="timer-button">
                  {isPlaying ?
                    (<PauseIcon className="timer-icon-button" />)
                    :
                    (<StartIcon className="timer-icon-button" />)}
                </button>

                <span >
                  {renderTime("seconds", elapsedTime, 0, allocatedTime, false)}
                </span>
              </span>
            );
          }}
        </CountdownCircleTimer>
      </div>
    )
  }
  else {
    if (countUpMode) {   // When AllocationTime > 0 && In case of overshoot
      return (
        <div className="timer-container">
          <CountdownCircleTimer
            key={key}
            isPlaying={isPlaying}
            duration={defaultTime}
            trailColor={"#DC0000"}
            colors={"#DC0000"}
            size={40}
            strokeWidth={5}
            strokeLinecap="square"
            initialRemainingTime={(Math.round(startTime) > Math.round(time)) 
                                  ? (defaultTime - timeStart) 
                                  : defaultTime}
            onUpdate={(elapsedTime) => {
              // Update Mendix value on timer update
              if (currentValue?.status === "available") {
                const t = parseFloat(time);
                const r = parseFloat(elapsedTime);
                const d = parseFloat(defaultTime);
                if(Math.round(startTime) > Math.round(time))
                   currentValue.setTextValue("" + ((d-r)/86400).toFixed(8));
                else
                  currentValue.setTextValue("" + ((d-r)/86400).toFixed(8));
              }
            }}
          >

            {({ elapsedTime }) => {

              return (
                <span>
                  <button onClick={onPauseClickHandler} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} className="timer-button">
                    {isPlaying ?
                      (<PauseIcon className="timer-icon-button" />)
                      :
                      (<StartIcon className="timer-icon-button" />)}
                  </button>

                  <span >
                    {renderTime("seconds", (elapsedTime > time)?(elapsedTime-time):elapsedTime, 0, allocatedTime,true)}
                  </span>
                </span>
              );
            }}
          </CountdownCircleTimer>
        </div>
      )
    }
    else {              // When AllocationTime > 0
      return (
        <div className="timer-container">
          <CountdownCircleTimer
            key={key}
            isPlaying={isPlaying}
            duration={time}
            colors={isPlaying ? ["#0F7EA5", "#0F7EA5", "#0F7EA5", "#0F7EA5"] : "#888888"}
            colorsTime={[time, time / 2, 30, 0]}
            size={40}
            initialRemainingTime={timeStart}
            strokeWidth={5}
            trailColor={isPlaying ? "#C0D3DB" : "#cccccc"}
            strokeLinecap="square"
            onComplete={handleComplete}
          >


            {({ remainingTime }) => {

              if (xx !== remainingTime) {
                setTimeout(() => setXx(remainingTime), 0); // avoid setting state during render
                const r = parseFloat(remainingTime);
                const d = parseFloat(time);
                currentValue.setTextValue("" + ((d-r)/86400).toFixed(8));
              }

              return (
                <span>
                  <button onClick={onPauseClickHandler} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }} className="timer-button">
                    {isPlaying ? <PauseIcon className="timer-icon-button" /> : <StartIcon className="timer-icon-button" />}
                  </button>
                  <span>
                    {renderTime("seconds", remainingTime, time, allocatedTime, false)}
                  </span>
                </span>
              );
            }}

          </CountdownCircleTimer>
        </div>
      )
    }

  }
}
