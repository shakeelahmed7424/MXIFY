import { createElement, useEffect, useState } from "react";
import { Big } from "big.js";
import { StepperComponent } from "./components/StepperComponent";
import { NSStepperComponent } from "./components/NSStepperComponent";

export function Stepper({ sampleText, dataList, listName, progressAction, currentItem, statusType, minIterations, taskListExecutionMode, stepperButtonClickAction }) {
  const [col, setCol] = useState(dataList);
  const [current, setCurrent] = useState(currentItem.value)
  useEffect(() => {
    setCol(dataList)
  }, [dataList]);

  useEffect(() => {
    setCurrent(currentItem.value)
  }, [currentItem]);


  if (col.status === "available" & current != null) {
    const taskexecution = taskListExecutionMode.get(col.items[0]).value
    if (taskexecution === "2") {
      return (

        <div>
          <NSStepperComponent statusType={statusType} minIterations={minIterations} sampleText={sampleText}
            dataList={col.items} listName={listName} progressAction={progressAction} currentI={current} stepperButtonClickAction={stepperButtonClickAction} />
        </div>

      );
    }
    else {
      return (

        <div>
          <StepperComponent statusType={statusType} minIterations={minIterations} sampleText={sampleText}
            dataList={col.items} listName={listName} progressAction={progressAction} currentI={current} stepperButtonClickAction={stepperButtonClickAction} />
        </div>

      );
    }
  } else if (col.status === "loading") {
    return <p>Loading... Please, wait...</p>;
  } else if (col.status === "unavailable") {
    return <p>There are no available items to show.</p>;
  }
}
