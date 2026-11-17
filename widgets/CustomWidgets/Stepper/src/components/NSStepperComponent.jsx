import { createElement, useState, useEffect, useRef, useLayoutEffect } from "react";
import { Steps } from "antd";
import { Button } from "antd";
import {
    LeftOutlined,
    RightOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseSquareOutlined
} from "@ant-design/icons";

import "./NSStepper.css";
const Step = Steps.Step;

var scrollL = 0;

export function NSStepperComponent({
    sampleText,
    dataList,
    listName,
    progressAction,
    currentI,
    statusType,
    minIterations,
    stepperButtonClickAction
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [Columns, setColumns] = useState(dataList);
    const [StepItems, setStepItems] = useState([]);
    const [pendingStep, setPendingStep] = useState(null);

    const scrollAmount = 264;
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        setColumns(dataList);
        console.log(dataList);
    }, [dataList]);

    useEffect(() => {
        setActiveStep(Number(currentI));
    }, [currentI]);

    useLayoutEffect(() => {
        scrollL = Number(currentI) * scrollAmount;
        scrollContainerRef.current.scrollLeft = scrollL;
    });

    useEffect(() => {
        let arr = [];
        for (let i = 0; i < Columns.length; i++) {
            let ob = { title: "", status: "" };
            ob.title = listName.get(Columns[i]).value;
            ob.status = statusType.get(Columns[i]).value;
            arr.push(ob);
        }

        setStepItems([...StepItems, ...arr]);
    }, []);

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        const action = progressAction.get(Columns[activeStep + 1]);

        if (action && action.canExecute) {
            action.execute();
        } else {
            console.warn("Something is wrong!");
        }
    };

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
        const action = progressAction.get(Columns[activeStep - 1]);
        action.execute();
    };

    //Stepper Logic for multiple steps -> N amount
    function MultipleSteps({ stepList, currentStep }) {
        const c = 0;

        return (
            <div className="NSStepContainer">
                {currentStep == 0 ? (
                    <Button
                        disabled
                        className="leftButton"
                        type="primary"
                        icon={<LeftOutlined style={{ fontSize: "24px", color: "grey" }} />}
                    ></Button>
                ) : (
                    <Button
                        className="leftButton"
                        type="primary"
                        icon={<LeftOutlined style={{ fontSize: "24px", color: "grey" }} />}
                        onClick={handleBack}
                    ></Button>
                )}

                <div className="ScrollableOuter">
                    <div className="ScrollableInner" ref={scrollContainerRef}>
                        <Steps current={currentStep} labelPlacement="vertical">
                            {stepList.map((step, index) => (
                                //let title1 = listName.get(step).value;
                                <Step
                                    title={
                                        minIterations.get(step).value > 0 ? (
                                            <span>
                                                <span className="asterisk">* </span> {listName.get(step).value}
                                            </span>
                                        ) : (
                                            <span>{listName.get(step).value}</span>
                                        )
                                    }
                                    icon={
                                        statusType.get(step).value === "false" ? (
                                            <CloseSquareOutlined className="red-icon" />
                                        ) : statusType.get(step).value === "true" ? (
                                            <CheckCircleOutlined className="green-icon" />
                                        ) : null
                                    }
                                    className={statusType.get(step).value === "" ? "nonumberIcon" : "customIcon"}
                                    onClick={() => onStepSelect(index)}
                                />
                            ))}
                        </Steps>
                    </div>
                </div>

                {currentStep == stepList.length - 1 ? (
                    <Button
                        disabled
                        className="rightButton"
                        type="primary"
                        icon={<RightOutlined style={{ fontSize: "24px", color: "grey", marginLeft: "2%" }} />}
                        onClick={handleNext}
                    ></Button>
                ) : (
                    <Button
                        style={{ fontSize: "24px", color: "grey", borderRight: '1px solid', borderRightColor: "#d9d9d9" }}
                        className="rightButton"
                        type="primary"
                        icon={<RightOutlined />}
                        onClick={handleNext}
                    ></Button>
                )}

                <div className="stepperButtonContainer">
                    <Button className="stepperButton" onClick={stepperButtonClick}>
                        {currentStep + 1 + "/" + stepList.length}
                    </Button>
                </div>
            </div>
        );
    }

    function StepList({ stepList, currentStep }) {
        return <MultipleSteps stepList={stepList} currentStep={currentStep} />;
    }
    // function to call when a stepper button is clicked
    const stepperButtonClick = () => {
        if (!stepperButtonClickAction) {
            console.warn("Stepper button action is not defined.");
            return;
        }

        const stepperAction = stepperButtonClickAction.get?.(Columns[activeStep]);

        if (stepperAction?.canExecute) {
            stepperAction.execute();
        } else {
            console.warn("Stepper action cannot be executed or is not available.");
        }
    };

    // function to call when a step is selected
    const onStepSelect = value => {
        setPendingStep(value);
    };

    // effect to update step and then run action
    useEffect(() => {
        if (pendingStep !== null) {
            setActiveStep(pendingStep);
        }
    }, [pendingStep]);

    useEffect(() => {
        if (pendingStep === activeStep && pendingStep !== null) {
            const action = progressAction.get(Columns[activeStep]);
            action.execute();
            setPendingStep(null); // reset pending step
        }
    }, [activeStep]);

    //Rendering
    return (
        <div>
            <StepList stepList={Columns} currentStep={Number(activeStep)} />
        </div>
    );
}
