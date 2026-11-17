import { createElement, useState, useRef, useEffect } from "react";
import DataCollectionGrid from "./components/DataCollectionGrid";
import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import DialogBox from "./components/DialogBox";
import "./ui/DataCollectionGrid.scss";
import { TreeSelect } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import TextField from "@mui/material/TextField";
import CheckIcon from "@mui/icons-material/Check";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export function CGrid({
    dataList,
    dropDownValues,
    dataCollectionName,
    zoomScale,
    dataCollectionRevision,
    dataCollectionUseROR,
    dataCollectionChangeAction,
    collectDataQrCodeClickAction,
    selectedDataCollection,
    selectedDataCollectionRevision,
    selectedDataCollectionIsROR,
    listName,
    upperLimit,
    persUpperLimit,
    dataValue,
    lowerLimit,
    persLowerLimit,
    rowCount,
    uom,
    enteredAmount,
    displayLimits,
    isLimitOverrideAllowed,
    isRequired,
    dataType,
    booleanTrue,
    booleanFalse,
    decimalScale,
    displayMode,
    isSubmitBtnEnabled,
    requestBody,
    selectedRowValue,
    selectedObjectDPName,
    containerName,
    serverUrl,
    bearerToken,
    CDOBaseType,
    CDOName,
    rowPosition,
    columnPosition,
    dataPointLayout,
    isParentDataCollection
}) {
    const [dataCollectionDefPicklistOptions, setDataCollectionDefPicklistOptions] = useState([]);
    const [col, setCol] = useState(dataList);
    const [tableDataChanged, setTableDataChanged] = useState(false);
    const selectedDataCollectionDef = useRef("");
    const selectedOptionRevision = useRef("");
    const selectedOptionIsROR = useRef(false);
    const [showDialog, setShowDialog] = useState(false);
    const [validatedTableData, setValidatedTableData] = useState([[]]);
    const [dataCollectionNames, setdataCollectionNames] = useState([]);

    const { TreeNode } = TreeSelect;
    //const [searchValue, setSearchValue] = useState("");
    const [value, setValue] = useState(undefined);
    const [previousValue, setPreviousValue] = useState(undefined);
    const selectedDataCollectionObject = useRef("");

    const onDataCollectionDefPicklistOptionChange = (newValue) => {
        if (newValue) {
            //setValue(newValue);
            selectedOptionRevision.current = newValue.value.substring(newValue.value.lastIndexOf(":") + 1,newValue.value.lastIndexOf("-"));
            //this check is for parent node and we are setting revision as empty 
            if (selectedOptionRevision.current == newValue) {
                selectedOptionRevision.current = "";
            }
            
            // if (selectedDataCollectionDef.current != newValue) {
            selectedDataCollectionObject.current = newValue;
            selectedDataCollectionDef.current = newValue.value.substring(0, newValue.value.lastIndexOf(":"));
            if (selectedDataCollectionDef.current == "") {
                selectedDataCollectionDef.current = newValue.value;
            }

            if (tableDataChanged) {
                setShowDialog(true);
            } else {
                
                confirmHandler(newValue);
            }
            // }
        }
    };

    useEffect(() => {
        setCol(dataList);
    }, [dataList]);

    const confirmHandler = newValue  => {
        setValue(newValue);
        setPreviousValue(newValue);

        setdataCollectionNames(
            // On autofill we get a stringified value.
            typeof selectedDataCollectionDef.current === "string"
                ? selectedDataCollectionDef.current.split(",")
                : value,
            (selectedDataCollection = selectedDataCollectionDef.current)
        );


        for (let i = 0; i < dropDownValues.items.length; i++) {
            let iteratorValue = dataCollectionName.get(dropDownValues.items[i]).value;
            let iteratorRevision = dataCollectionRevision.get(dropDownValues.items[i]).value;
            let iteratorROR = dataCollectionUseROR.get(dropDownValues.items[i]).value;

            if (
                iteratorValue == selectedDataCollection &&
                (iteratorRevision == selectedOptionRevision.current ||
                    (selectedOptionRevision.current == ""))
            ) {
                //If user select parent data collection then below condition will be true
                if (iteratorRevision != selectedOptionRevision.current) {
                    selectedOptionRevision.current = "";
                    selectedOptionIsROR.current = true;
                    isParentDataCollection.setValue("True");  //setting this value false in Nanoflow
                }
                 //This is going true when user selects child node in that case revision is available
                if(iteratorRevision == selectedOptionRevision.current)
                {
                    selectedOptionIsROR.current = false;
                }
                const actionOnFirstItem = dataCollectionChangeAction.get(dropDownValues.items[i]);
                actionOnFirstItem.execute();
                break;
            }
        }
        setShowDialog(false);
        setTableDataChanged(false);
    };

    const cancelHandler = () => {
        selectedOptionRevision.current = previousValue.value.substring(previousValue.value.lastIndexOf(":") + 1,previousValue.value.lastIndexOf("-"));
        //this check is for parent node and we are setting revision as empty 
        if (selectedOptionRevision.current == previousValue) {
            selectedOptionRevision.current = "";
        }
        
        // if (selectedDataCollectionDef.current != newValue) {
        //selectedDataCollectionObject.current = newValue;
        selectedDataCollectionDef.current = previousValue.value.substring(0, previousValue.value.lastIndexOf(":"));
        if (selectedDataCollectionDef.current == "") {
            selectedDataCollectionDef.current = previousValue.value;
        }
       
        setValue(previousValue);
        setShowDialog(false);
    };

    const handleChange = event => {
        const {
            target: { value }
        } = event;

        if (selectedDataCollectionDef.current != value) {
            selectedDataCollectionDef.current = value;

            if (tableDataChanged) {
                setShowDialog(true);
            } else {
                confirmHandler();
            }
        }
    };

    const checkIsROR = value => { 
        if (value == "true") {
            return true;
        } else {
            return false;
        }
    };
    const onPicklistVisibleChange = open => {
        if (!open) {
            setDataCollectionDefPicklistOptions([]);
        } else {
            var picklistOptionsLocal = [];

            if (dropDownValues.status === "available") {
                dropDownValues.items.forEach(item => {
                    var name = dataCollectionName.get(item).value;
                    let existing = picklistOptionsLocal.find(x => x.name == name);
                    var option = {
                        name: name,
                        revision: dataCollectionRevision.get(item).value,
                        ROR: dataCollectionUseROR.get(item).value
                    };
                    if (existing) {
                        existing.child.push(option);
                    } else {
                        picklistOptionsLocal.push(option);
                        picklistOptionsLocal[picklistOptionsLocal.length - 1].child = [];
                        picklistOptionsLocal[picklistOptionsLocal.length - 1].child.push(option);
                    }
                });
                setDataCollectionDefPicklistOptions(picklistOptionsLocal);
            }
        }
    };
    // const onSearch = value => {
    //     setSearchValue(value);
    // };
    // const onClear = () => {
    //     setSearchValue("");
    //     setValue(undefined);
    // };
    // const handleKeyDown = (e) => {
    //     if (e.key === 'Backspace' && value) {
    //       setValue(null);
    //     }
    //   };

    if (col.status === "available") {
        if (dropDownValues.items && dropDownValues.items.length === 1) {
            selectedDataCollectionDef.current = dataCollectionName.get(dropDownValues.items[0]).value;
            selectedOptionRevision.current = dataCollectionRevision.get(dropDownValues.items[0]).value;
        }

        return (
            <div className="cgrid">
                {dropDownValues.items && dropDownValues.items.length > 1 && (
                    <>
                        <div className={"dataCollectionDef-SelectControl"}>
                            {showDialog && (
                                <DialogBox
                                    ShouldDialogShow={showDialog}
                                    handleClose={cancelHandler}
                                    handleOk={() => confirmHandler(selectedDataCollectionObject.current)}
                                />
                            )}
                            <div>
                                <p className={"dataCollectionDef-SelectControl-label"}>Data Collection Def</p>
                            </div>

                            <TreeSelect
                                showSearch
                                value={value}
                                suffixIcon={<ArrowDropDownIcon className="picklist-ArrowDropDownIcon" />}
                                className="dataCollectionDef-FormControl"
                                //placeholder="Please select"
                                allowClear
                                //multiple
                                //treeDefaultExpandAll
                                // searchValue={searchValue}
                                // onSearch={onSearch}
                                //onClick={handleonClick}
                                //onKeyDown={handleKeyDown}
                                onChange={onDataCollectionDefPicklistOptionChange}
                                onDropdownVisibleChange={onPicklistVisibleChange}
                                //onClear={onClear}
                                labelInValue   // Enables value to be an object 
                            >
                                {dataCollectionDefPicklistOptions.map(item => (
                                    <TreeNode value={item.name} title={item.name}>
                                        {item.child &&
                                            item.child.map((child,index ) => (
                                                
                                                <TreeNode
                                                    value={item.name + ":" + child.revision +'-'+ index}
                                                    title={
                                                        <span>
                                                            <span className="Picklist-element">
                                                                {checkIsROR(child.ROR) && (
                                                                    <CheckIcon className="Picklist-Checkicon" />
                                                                )}
                                                            </span>
                                                            {item.name + ":" + child.revision}
                                                        </span>
                                                    }
                                                    key={item.name + ":" + child.revision +'-'+ index} 
                                                ></TreeNode>
                                            ))}
                                    </TreeNode>
                                ))}
                            </TreeSelect>
                        </div>
                    </>
                )}
                <DataCollectionGrid
                    enteredAmount={enteredAmount}
                    dataList={col}
                    dropDownValues={dropDownValues}
                    listName={listName}
                    dataValue={dataValue}
                    lowerLimit={lowerLimit}
                    persLowerLimit={persLowerLimit}
                    upperLimit={upperLimit}
                    persUpperLimit={persUpperLimit}
                    rowCount={rowCount}
                    uom={uom}
                    displayLimits={displayLimits}
                    isLimitOverrideAllowed={isLimitOverrideAllowed}
                    isRequired={isRequired}
                    dataType={dataType}
                    booleanTrue={booleanTrue}
                    booleanFalse={booleanFalse}
                    decimalScale={decimalScale}
                    setTableDataChanged={setTableDataChanged}
                    validatedTableData={validatedTableData}
                    setValidatedTableData={setValidatedTableData}
                    isSubmitBtnEnabled={isSubmitBtnEnabled}
                    requestBody={requestBody}
                    selectedRowValue={selectedRowValue}
                    selectedDataCollection={selectedDataCollectionDef.current}
                    selectedDataCollectionRevision={selectedOptionRevision.current}
                    selectedDataCollectionIsROR={selectedOptionIsROR.current}
                    displayMode={displayMode}
                    selectedObjectDPName={selectedObjectDPName}
                    CDOBaseType={CDOBaseType}
                    CDOName={CDOName}
                    containerName={containerName}
                    zoomScale={zoomScale}
                    serverUrl={serverUrl}
                    bearerToken={bearerToken}
                    rowPosition={rowPosition}
                    columnPosition={columnPosition}
                    dataPointLayout={dataPointLayout}
                    collectDataQrCodeClickAction= {collectDataQrCodeClickAction}
                />
            </div>
        );
    } else if (col.status === "loading") {
        return <p>Loading... Please, wait...</p>;
    } else if (col.status === "unavailable") {
        return <p>There are no available items to show.</p>;
    }
}
