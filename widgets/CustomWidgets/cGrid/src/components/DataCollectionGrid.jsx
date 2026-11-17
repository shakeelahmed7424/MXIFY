import { useState, useEffect, createElement, useRef } from "react";
import { hot } from "react-hot-loader/root";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from '@mui/material/InputAdornment';
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import "../ui/DataCollectionGrid.scss";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import WarningIcon from "@mui/icons-material/Warning";
import CommandBarBtn from "./CommandBarBtn";
import { AddIcon, TrashIcon } from "./Icons";
import NumericInputField from "./NumericInputField";
import VerticalSeparator from "./VerticalSeparator";
import SwitchControl from "./SwitchControl";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import { TreeSelect } from "antd";
import CheckIcon from "@mui/icons-material/Check";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BarcodeImage from "./BarcodeImage";
import Tooltip from '@mui/material/Tooltip';

const { TreeNode } = TreeSelect;


const OUT_OF_LIMIT = "OUT_OF_LIMIT";
const DECIMAL_SCALE_ERROR = "decimal_scale_error";
const VALID = "valid";
const INVALID_TEXT = "invalid_text";
const WARNING_TEXT = "warning_text";
const DAY_FIRST_FORMAT = "DD/MM/YYYY hh:mm A";
const MONTH_FIRST_FORMAT = "MM/DD/YYYY hh:mm A";
let dateTimeFormat;

//display mode: 1 - dropdown, 2 - picklist, 4 - none

function DataCollectionGrid({
    dataList,
    dropDownValues,
    selectedDataCollection,
    selectedDataCollectionRevision,
    selectedDataCollectionIsROR,
    listName,
    upperLimit,
    persUpperLimit,
    dataValue,
    lowerLimit,
    persLowerLimit,
    uom,
    displayLimits,
    isLimitOverrideAllowed,
    isRequired,
    dataType,
    booleanTrue,
    booleanFalse,
    decimalScale,
    setTableDataChanged,
    validatedTableData,
    setValidatedTableData,
    requestBody,
    selectedRowValue,
    isSubmitBtnEnabled,
    displayMode,
    containerName,
    zoomScale,
    serverUrl,
    bearerToken,
    CDOBaseType,
    CDOName,
    rowPosition,
    columnPosition,
    dataPointLayout,
    collectDataQrCodeClickAction
}) {
    const scaleValue = zoomScale.value;
    const fontSize=''; 
    const gridHeight='';
    const [columns, setColumns] = useState(dataList);
    const [tabbingVertical, setTabbingVertical] = useState(false);
    const [row, setRow] = useState([1]);
    const [selectedRow, setSelectedRow] = useState(-1);
    //const [selectedRowValue, setSelectedRowValue] = useState(-1);
    const [focusedStateOfTableData, setFocusedStateOfTableData] = useState([[]]);
    const [rowsToAdd, setRowsToAdd] = useState(1);
    const [errorMessages, setErrorMessages] = useState([[]]);
    const [objectDPSelectionValuesList, setObjectDPSelectionValuesList] = useState([]);
    const objectDataPointSelectionValuesList = useRef([]);
    const [value, setValue] = useState(undefined);
    const [picklistOptions, setpicklistOptions] = useState([]);
    const [showQRCodeIconsState, setStateShowQrCodeIcons] = useState([]);
    const [tableData, setTableData] = useState(() => {
        const storedData = localStorage.getItem('tableData');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                return parsedData;
            } catch (error) {
                console.error("Error parsing tableData from localStorage:", error);
            }
        }
        return [[]];

    });

    dateTimeFormat = false ? DAY_FIRST_FORMAT : MONTH_FIRST_FORMAT;

    // used to store the state of the QR code image clicked
    let initialCollectDataQRObject = {
        isQrImageClicked: false,
        rowIndex: null,
        columnIndex: null
    };

         useEffect(() => {
    document.documentElement.style.setProperty("--mui-scale", scaleValue);
    document.documentElement.style.setProperty("--font-size", zoomScale.value == '1.5' ? '16px': '12px');
    document.documentElement.style.setProperty("--grid-height", zoomScale.value == '1.5' ? 'auto': 'calc(100% - 40px)');
    document.documentElement.style.setProperty("--grid-max-height", zoomScale.value == '1.5' ? '20vh': 'stretch');
    document.documentElement.style.setProperty("--grid-min-height", zoomScale.value == '1.5' ? 'calc(20vh - 60px)': 'auto');
  }, [scaleValue,zoomScale.value,zoomScale.value]);

    useEffect(() => {
        setColumns(dataList);
        setTableData([[]]);
        setErrorMessages([[]]);
    }, [dataList]);

    useEffect(() => {
        const collectDataQRObject = getCollectDataQRObject();
        if (!collectDataQRObject.isQrImageClicked) {
            setTableData([[]]);
            setValidatedTableData([[]]);
            setRow([1]);
            setErrorMessages([[]]);
            setSelectedRow(-1);
            setFocusedStateOfTableData([[]]);
            setRowsToAdd(1);
            setObjectDPSelectionValuesList(new Array(columns.items.length));
            objectDataPointSelectionValuesList.current = new Array(columns.items.length);
        }
        else {
            CheckIfAttributeValueChangedByScan();
        }
    }, [columns]);

    useEffect(() => {
        handleTabbingChange(tabbingVertical);
    }, [row]);

    useEffect(() => {
        row.forEach((r, rowIndex) => {
            columns.items.forEach((s, columnIndex) => {
                validateTableData(rowIndex, columnIndex, s);
            });
        });
    }, [tableData]);

    useEffect(() => {
        enableSubmitBtn();
        prepareRequestBody();
    }, [validatedTableData]);


    const enableSubmitBtn = () => {
        if (selectedDataCollection.length === 0 || columns.items.length === 0) {
            isSubmitBtnEnabled.setTextValue("" + -1);
            return;
        }
        for (let rowIndex = 0; rowIndex < row.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < columns.items.length; columnIndex++) {
                let currentValidatedTableData = getValidatedTableDataValue(rowIndex, columnIndex);
                if (currentValidatedTableData === DECIMAL_SCALE_ERROR) {
                    isSubmitBtnEnabled.setTextValue("" + 0);
                    return;
                }
                if (
                    isRequired.get(columns.items[columnIndex]).value &&
                    currentValidatedTableData === null
                ) {
                    isSubmitBtnEnabled.setTextValue("" + 0);
                    return;
                }
            }
        }
        let modifiedCellCount = 0;
        for (let rowIndex = 0; rowIndex < row.length; rowIndex++) {
            for (let columnIndex = 0; columnIndex < columns.items.length; columnIndex++) {
                let currentValidatedTableData = getValidatedTableDataValue(rowIndex, columnIndex);
                if (currentValidatedTableData === null) {
                    continue;
                } else {
                    modifiedCellCount++;
                    break;
                }
            }
            if (modifiedCellCount > 0) {
                break;
            }
        }
        if (modifiedCellCount === 0) {
            isSubmitBtnEnabled.setTextValue("" + 0);
            return;
        }
        isSubmitBtnEnabled.setTextValue("" + 1);
    };

    const toIsoString = date => {
        var tzo = -date.getTimezoneOffset(),
            dif = tzo >= 0 ? "+" : "-",
            pad = function (num) {
                return (num < 10 ? "0" : "") + num;
            };

        return (
            date.getFullYear() +
            "-" +
            pad(date.getMonth() + 1) +
            "-" +
            pad(date.getDate()) +
            "T" +
            pad(date.getHours()) +
            ":" +
            pad(date.getMinutes()) +
            ":" +
            pad(date.getSeconds()) +
            dif +
            pad(Math.floor(Math.abs(tzo) / 60)) +
            ":" +
            pad(Math.abs(tzo) % 60)
        );
    };

       const prepareRequestBody = () => {
        let dataPointDetails = [];        
        row.forEach((r, rowIndex) => {
            columns.items.forEach((s, columnIndex) => {
                let currentValidatedTableData = getValidatedTableDataValue(rowIndex, columnIndex);
                if (
                    currentValidatedTableData !== DECIMAL_SCALE_ERROR &&
                    currentValidatedTableData !== null
                ) {
                    const dataValue =
                        dataType.get(s).value?.c[0] === 6
                            ? toIsoString(new Date(parseInt(tableData[rowIndex][columnIndex])))
                            : dataType.get(s).value?.c[0] === 7
                                ? tableData[rowIndex][columnIndex] === booleanTrue.get(s).value
                                    ? "True"
                                    : "False"
                                : tableData[rowIndex][columnIndex];

                    const useROR = dataValue?.lastIndexOf(":") == dataValue?.length - 1 ? true : false;

                    dataPointDetails.push({
                        "Node": rowIndex,
                        "@odata.type": "#shopfloor.DataPointDetails",
                        DataPoint: {
                            "@odata.type": "#shopfloor.DataPoint",
                            Name: listName.get(s).value,
                            //If user select parent data collection then we are setting UseROR as true
                            Parent: selectedDataCollectionIsROR == true ? {
                                "@odata.type": "#shopfloor.UserDataCollectionDef",
                                Name: selectedDataCollection,
                                Revision: "",
                                UseROR: true
                            }
                                : {
                                    "@odata.type": "#shopfloor.UserDataCollectionDef",
                                    Name: selectedDataCollection,
                                    Revision: selectedDataCollectionRevision,
                                    //UseROR: selectedDataCollectionIsROR
                                }
                        },
                        DataType: dataType.get(s).value,
                        DataValue: dataValue,
                        OriginalValue: dataValue,
                        NDOValue:
                            dataType.get(s).value == 5 && CDOBaseType.get(s).value == 1
                                ? { "@odata.type": "#shopfloor." + CDOName.get(s).value, Name: dataValue }
                                : null,
                        RDOValue:
                            dataType.get(s).value == 5 && CDOBaseType.get(s).value == 2
                                ? useROR
                                    ? {
                                        "@odata.type": "#shopfloor." + CDOName.get(s).value,
                                        //Name: dataValue,
                                        Name: dataValue?.substring(0, dataValue.lastIndexOf(":")),
                                        UseROR: useROR
                                    }
                                    : {
                                        "@odata.type": "#shopfloor." + CDOName.get(s).value,
                                        //Name: dataValue,
                                        Name: dataValue?.substring(0, dataValue.lastIndexOf(":")),
                                        Revision: dataValue?.substring(dataValue.lastIndexOf(":") + 1)
                                    }
                                : null
                    });
                }
            });
            // requestBody.setValue(JSON.stringify(dataPointDetails));
        });
        requestBody.setValue(JSON.stringify(dataPointDetails));
    };

    const showErrorMessage = (rowIndex, columnIndex, showError) => {
        setFocusedStateOfTableData(oldData => {
            const newData = oldData.map(row => [...row]); // Create a shallow copy of each row

            if (!newData[rowIndex]) {
                newData[rowIndex] = [[]];
            }

            newData[rowIndex][columnIndex] = showError;
            return newData;
        });
    };

    const setselectedrowValueS =(rowIndex) =>{
   selectedRowValue.setValue(JSON.stringify(rowIndex));
   return selectedRowValue;
    };


    const getValidationIcon = (currentColumn, rowIndex, columnIndex, displayValue) => {
        if (!isValidationErrorVisible(rowIndex, columnIndex)) {
            return null;
        }
        const currentDataType = dataType.get(currentColumn).value?.c[0];
        let currentValidatedTableData = getValidatedTableDataValue(rowIndex, columnIndex)?.toLowerCase() || '';
        let cssClassName = getValidationIconCSSClass(currentColumn, displayValue, currentValidatedTableData);

        if (currentDataType !== 5) {
            if (currentValidatedTableData === 'valid') {
                return <CheckBoxIcon className={cssClassName} />;
            } else if (currentValidatedTableData === INVALID_TEXT || currentValidatedTableData === DECIMAL_SCALE_ERROR) {
                return <WarningIcon className={cssClassName} />;
            } else if (currentValidatedTableData === WARNING_TEXT) {
                return <WarningIcon className={cssClassName} />;
            }
        }
        return null;
    };

    const isValidationErrorVisible = (rowIndex, columnIndex) => {
        return focusedStateOfTableData[rowIndex]?.[columnIndex] ? true : false;
    }


    const getValidationIconCSSClass = (currentColumn, displayValue, currentValidatedTableData) => {
        let isCurrentFieldRequired = isRequired.get(currentColumn).value;
        let cssClassName = "";
        if (currentValidatedTableData === 'valid') {
            cssClassName = displayValue == 1
                ? "grid-cell-icon-rowColumn grid-cell-icon-rowColumn_success-rowColumn"
                : "grid-cell-icon grid-cell-icon_success";
        } else if (currentValidatedTableData === INVALID_TEXT || currentValidatedTableData === DECIMAL_SCALE_ERROR) {
            cssClassName = displayValue == 1
                ? "grid-cell-icon-rowColumn grid-cell-icon-rowColumn_error-rowColumn"
                : "grid-cell-icon grid-cell-icon_error";
        } else if (currentValidatedTableData === WARNING_TEXT) {
            cssClassName = displayValue == 1
                ? "grid-cell-icon-rowColumn grid-cell-icon-rowColumn_warning-rowColumn"
                : "grid-cell-icon grid-cell-icon_warning";
        }
        if (displayValue == 1) {
            cssClassName += " top5";
        }
        return cssClassName;
    }



    const renderErrorMessage = (rowIndex, columnIndex, displayValue) => {
        const errorMessage = errorMessages[rowIndex]?.[columnIndex];

        if (isValidationErrorVisible(rowIndex, columnIndex) && errorMessage && errorMessage !== OUT_OF_LIMIT) {
            if (displayValue === 1) {
                return (
                    <div>
                        <div className="error-message-rowColumn">
                            Error&nbsp;-&nbsp;{errorMessage}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div className="error-message">
                        <span>Error&nbsp;</span>-&nbsp;{errorMessage}
                    </div>
                );
            }
        }
        return null;
    };


    const validateTableData = (rowIndex, columnIndex, s) => {
        let currentValue = getTableDataValue(rowIndex, columnIndex);
        if (currentValue !== null) {

            const getLimitValue = (limit, dataType, booleanTrue, booleanFalse) => {
                if (dataType === 7) {
                    return limit === "True" ? booleanTrue.get(s).value : booleanFalse.get(s).value;
                }
                return limit;
            };

            const dataValidity = isValidData(
                currentValue,
                getLimitValue(lowerLimit.get(s).value, dataType.get(s).value?.c[0], booleanTrue, booleanFalse),
                getLimitValue(upperLimit.get(s).value, dataType.get(s).value?.c[0], booleanTrue, booleanFalse),
                decimalScale.get(s).value?.c[0],
                dataType.get(s).value?.c[0]
            );

            setErrorMessages(oldData => {

                const newData = oldData.map(row => [...row]); // Deep copy of the data

                // Ensure the row exists or is created
                if (rowIndex < 0 || rowIndex >= newData.length) {
                    while (rowIndex >= newData.length) {
                        const newRow = Array(columnIndex + 1).fill(""); // Create a row with the right number of columns
                        newData.push(newRow);
                    }
                }

                // Ensure the column exists or is created
                if (columnIndex < 0 || columnIndex >= newData[rowIndex].length) {
                    while (columnIndex >= newData[rowIndex].length) {
                        newData[rowIndex].push(""); // Add empty columns until the column index is reached
                    }
                }

                // Set the value at the specific row and column
                newData[rowIndex][columnIndex] = dataValidity;

                return newData;
            });

            setValidatedTableData(oldData => {
                const newData = [...oldData];
                const cellValue = tableData[rowIndex][columnIndex]?.trim();
                const isRequiredField = isRequired.get(s)?.value;
                const isOverrideAllowed = isLimitOverrideAllowed.get(s)?.value;

                let validationResult = null;

                if (cellValue === "" || cellValue === undefined) {
                    validationResult = isRequiredField ? INVALID_TEXT : null;
                } else if (dataValidity === null) {
                    validationResult = VALID;
                } else if (dataValidity === OUT_OF_LIMIT) {
                    validationResult = isOverrideAllowed ? WARNING_TEXT : INVALID_TEXT;
                } else {
                    validationResult = DECIMAL_SCALE_ERROR;
                }

                newData[rowIndex] = [...newData[rowIndex]];
                newData[rowIndex][columnIndex] = validationResult;

                return newData;
            });

        }
    };

    /*
 Validate the data entered in input or select with 
 lower limt, uppoer limit and decimal scale
 dataType 1 is for integer
 dataType 2 is for Decimal
 dataType 4 is for string
 dataType 5 is for object
 dataType 6 is for dateTime
 dataType 7 is for boolean
 */
    const isValidData = (fieldValue, lowerLimit, upperLimit, decimalScale, dataType) => {
        if (fieldValue === undefined || fieldValue == null) return null;

        const trimmedValue = fieldValue.trim();
        if (dataType === 5) return null;

        const isOutOfLimit = (value, lower, upper) => {
            if (lower && value < lower) return OUT_OF_LIMIT;
            if (upper && value > upper) return OUT_OF_LIMIT;
            return null;
        };

        if (dataType === 4) {
            const lower = lowerLimit?.toLowerCase();
            const upper = upperLimit?.toLowerCase();
            const value = trimmedValue.toLowerCase();

            if (!lower && !upper) return null;
            if (!lower) return value <= upper ? null : OUT_OF_LIMIT;
            if (!upper) return value >= lower ? null : OUT_OF_LIMIT;

            return (value >= lower && value <= upper) ? null : OUT_OF_LIMIT;
        }

        if (dataType === 6) {
            if (trimmedValue === "NaN") return "Invalid timestamp";

            const value = parseInt(trimmedValue);
            return isOutOfLimit(value, Date.parse(lowerLimit), Date.parse(upperLimit));
        }

        if (dataType === 7) {
            return (trimmedValue === lowerLimit || trimmedValue === upperLimit) ? null : OUT_OF_LIMIT;
        }

        if (decimalScale > 9) return "Decimal scale should be between 0 and 9";

        const validNumber = /^-?\d+(\.\d+)?$/;
        const integer = /^-?\d+$/;
        const decimal = new RegExp(`^-?\\d+(\\.\\d{${decimalScale}})?$`);

        if (trimmedValue.length > 0) {           
            if (!validNumber.test(trimmedValue)) return "Please enter valid number";
            if (decimalScale >= 0 && decimalScale !== 0 && !decimal.test(trimmedValue)) return `${decimalScale} decimal places required`;
            if (dataType === 1 && !integer.test(trimmedValue)) return "Floating point number is not allowed";
        }

        const value = parseFloat(trimmedValue);
        const lower = parseFloat(lowerLimit);
        const upper = parseFloat(upperLimit);

        if (isNaN(lower) && isNaN(upper)) return null;
        if (isNaN(lower)) return value <= upper ? null : OUT_OF_LIMIT;
        if (isNaN(upper)) return value >= lower ? null : OUT_OF_LIMIT;
        return (value >= lower && value <= upper) ? null : OUT_OF_LIMIT;
    };


    const addMoreRows = () => {
        var rowCount = row.length;
        var start = 0;
        if (rowCount == 0) {
            start = 1;
        } else {
            start = parseInt(row[row.length - 1], 10) + 1;
        }

        for (let i = start; i < start + rowsToAdd; i++) {
            setRow(prevData => [...prevData, i]);
            setTableData(prevData => [...prevData, []]);
            setValidatedTableData(prevData => [...prevData, []]);
            setErrorMessages(prevData => [...prevData, []]);
        }
    };

    const selectRow = r => {
        setSelectedRow(r);
        //selectedRowValue = selectedRow;
         //setSelectedRowValue.setValue(JSON.stringify(r));
        console.log('shivani1',selectedRow);
         console.log('shivaniT1',selectedRowValue);
         console.log('malvi1');
       console.log('pari',r);
    };

    const deleteSelectedRow = () => {
        setTableData(tableData.filter((_, i) => i !== selectedRow));
        setValidatedTableData(validatedTableData.filter((_, i) => i !== selectedRow));
        setErrorMessages(errorMessages.filter((_, i) => i !== selectedRow));
        setRow(row.filter((_, i) => i !== selectedRow));
        setSelectedRow(-1);
        // setSelectedRowValue(JSON.stringify(selectedRow));
        // console.log('shivani',selectedRow);
        //  console.log('shivaniT',selectedRowValue);
        //  console.log('malvi');
    };

    // Handle the change in the table data
    const handleTableDataChange = (e, rowIndex, columnIndex) => {
        let currentData = e.target.value;
        if (currentData !== null && currentData !== undefined) {
            updateTableData(currentData, rowIndex, columnIndex);
            resetCollectDataQRObject();
        }
    };

    // Get the value of the table data
    const getTableDataValue = (rowIndex, columnIndex) => {
        let value = (tableData && tableData[rowIndex] && tableData[rowIndex][columnIndex] !== undefined)
            ? tableData[rowIndex][columnIndex]
            : null;
        return value;
    }

    // Get the value of the validated table data
    const getValidatedTableDataValue = (rowIndex, columnIndex) => {
        let value = (validatedTableData && validatedTableData[rowIndex] && validatedTableData[rowIndex][columnIndex] !== undefined)
            ? validatedTableData[rowIndex][columnIndex]
            : null;
        return value;
    }

    // Update the table data
    const updateTableData = (data, rowIndex, columnIndex) => {
        setTableDataChanged(true);
        setTableData(oldData => {
            const newData = oldData.map(row => [...row]); // Deep copy

            if (rowIndex < 0 || rowIndex >= newData.length) {
                // Row doesn't exist, create it.  We need to know the column count to make it the right size.
                const newRow = Array(columnIndex + 1).fill(""); // Create a new row filled with empty strings up to the target column
                newData.push(newRow);
            } else if (columnIndex < 0 || columnIndex >= newData[rowIndex].length) {
                // Row exists, but column doesn't, add the necessary columns.
                newData[rowIndex].length = columnIndex + 1; // Extend the row's length
                newData[rowIndex][columnIndex] = ""; // Fill the new space with a default value. This is necessary for the next step.
            }
            newData[rowIndex][columnIndex] = data;

            return newData;
        });
    };

    // Get the saved state of the QR code image clicked from local storage
    const getCollectDataQRObject = () => {
        const savedState = localStorage.getItem("collectDataQRObject");
        return savedState ? { ...initialCollectDataQRObject, ...JSON.parse(savedState) } : { ...initialCollectDataQRObject };
    };

    // Handle the QR code image click and will call the nanoflow
    const handleQRCodeClick = (currentObject, rowIndex, columnIndex) => {
        if (collectDataQrCodeClickAction && currentObject) {
            try {
                var collectObject = { isQrImageClicked: true, rowIndex: rowIndex, columnIndex: columnIndex };
                localStorage.setItem("collectDataQRObject", JSON.stringify(collectObject));
                localStorage.setItem('tableData', JSON.stringify(tableData));
                const nanoFlow = collectDataQrCodeClickAction.get(currentObject);
                nanoFlow.execute();
            } catch (error) {
                console.error("Error while executing nanoFlow", error);
            }
        }
    };

    const moveToNextInput = (rowIndex, columnIndex) => {
        let nextRowIndex = rowIndex;
        let nextColumnIndex = columnIndex;

        if (tabbingVertical) {
            nextRowIndex += 1;

            if (nextRowIndex >= row.length) {
                nextRowIndex = 0;  // Move to the first row
                nextColumnIndex += 1; // Move to the next column
            }
        } else {
            nextColumnIndex += 1;

            if (nextColumnIndex >= columns.items.length) {
                nextColumnIndex = 0;
                nextRowIndex += 1;
            }
        }

        if (nextRowIndex >= row.length || nextColumnIndex >= columns.items.length) {
            return;
        }

        const nextCellId = row[nextRowIndex] + columns.items[nextColumnIndex]?.id;
        const nextInput = document.getElementById(nextCellId);

        if (nextInput) {
            nextInput.focus();
        }
    };


    const getCollectDataQRCodeCssClass = (currentObject, qrCodeObjectType) => {
        let qrCodeCssClass = "pull-down-QR_RowColumn";
        if (qrCodeObjectType === "dropDown") {
            qrCodeCssClass += " right30";

            if (isRequired.get(currentObject).value) {
                qrCodeCssClass += " top30";
            } else {
                qrCodeCssClass += " top20";
            }
        }

        return qrCodeCssClass;
    }

    // Check if the attribute value has changed by QR scan 
    const CheckIfAttributeValueChangedByScan = () => {
        if (columns.items.length > 0) {
            const collectDataQRObject = getCollectDataQRObject();
            const { rowIndex, columnIndex, isQrImageClicked } = collectDataQRObject; // Destructuring
            let currentColumn = columns.items[columnIndex];

            if (isQrImageClicked) {
                let scannedValue = dataValue.get(currentColumn).value;
                if (displayMode.get(currentColumn).value?.c[0] === 1) {//Assigning the value to the dropdown

                    let dropdownValue = objectDataPointSelectionValuesList.current[columnIndex].find(obj => obj.toLowerCase() == scannedValue.toLowerCase());
                    if (dropdownValue) {
                        scannedValue = dropdownValue;
                    }
                }

                let storedLocalTableData = null;
                try {
                    const storedData = localStorage.getItem("tableData");
                    if (storedData) {
                        storedLocalTableData = JSON.parse(storedData);
                    }
                } catch (error) {
                    console.error("Error parsing tableData from local storage:", error);
                }

                if (storedLocalTableData) {
                    setTableData(storedLocalTableData);
                }
                updateTableData(scannedValue, rowIndex, columnIndex);
                moveToNextInput(rowIndex, columnIndex)
            }
            dataValue.get(currentColumn).value = null;
            resetCollectDataQRObject();
        } else { //Handling the case where user has clicked on QR code and then reload the page
            localStorage.removeItem("collectDataQRObject");
            localStorage.removeItem("tableData");
        }
    };

    // dataType 1 is for integer
    // dataType 2 is for Decimal
    // dataType 4 is for string
    // dataType 5 is for object
    // dataType 6 is for dateTime
    // dataType 7 is for boolean
    const getQRScannedValue = (columnIndex) => {
        const currentDataType = dataType.get(columns.items[columnIndex]).value;
        let currentDataValue = dataValue.get(columns.items[columnIndex]).value;
        switch (currentDataType) {
            case 1:
                currentDataValue = parseInt(currentDataValue);
                break;
            case 2:
                currentDataValue = parseFloat(currentDataValue);
                break;
        }
        return currentDataValue;

    }
    // Reset the state of the QR code image clicked
    const resetCollectDataQRObject = () => {
        localStorage.setItem("collectDataQRObject", JSON.stringify(initialCollectDataQRObject));
    }

    const isQRCodeIconVisible = (rowIndex, columnIndex) => {
        return showQRCodeIconsState && showQRCodeIconsState[rowIndex + "_" + columnIndex];
    }
    // Show the QR code image icon
    const showQRCodeIcon = (rowIndex, columnIndex, showValidationIcon) => {
        setStateShowQrCodeIcons((prevState) => ({ ...prevState, [rowIndex + "_" + columnIndex]: showValidationIcon }));
    }

    const useOutsideAlerter = ref => {
        useEffect(() => {
            function handleClickOutside(event) {
                if (
                    ref.current &&
                    !ref.current.contains(event.target) &&
                    (!document.getElementById("contextual-command-bar") ||
                        !document.getElementById("contextual-command-bar").contains(event.target))
                ) {
                    setSelectedRow(-1);
                }

            }
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, [ref]);
    };

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef);

    const handleTabbingChange = isChecked => {
        setTabbingVertical(isChecked);
        let cellCount = 1;
        if (isChecked) {
            for (let i = 0; i < columns.items.length; i++) {
                for (let j = 0; j < row.length; j++) {
                    const cellLocation = row[j] + columns.items[i].id;
                    const vcell = document.getElementById(cellLocation);
                    vcell.tabIndex = cellCount++;
                }
            }
        } else {
            for (let i = 0; i < row.length; i++) {
                for (let j = 0; j < columns.items.length; j++) {
                    const cellLocation = row[i] + columns.items[j].id;
                    const hcell = document.getElementById(cellLocation);
                    hcell.tabIndex = cellCount;
                }
            }
        }
    };

    const generateLimitsString = s => {
        let dataTypeValue = dataType.get(s).value;
        let lowerValue = lowerLimit.get(s).value;
        let upperValue = upperLimit.get(s).value;
        let limits;
        if (dataTypeValue?.c[0] !== 7) {
            if (decimalScale.get(s).value !== undefined) {
                lowerValue = persLowerLimit.get(s).value;
                upperValue = persUpperLimit.get(s).value;
            }
            if (!lowerValue && !upperValue) {
                limits = "";
            } else if (!lowerValue) {
                limits = `<= ${upperValue}`;
            } else if (!upperValue) {
                limits = `>= ${lowerValue}`;
            } else {
                limits = `${lowerValue} - ${upperValue}`;
            }
        } else {
            const lowerIsTrue = lowerValue === "True";
            const upperIsTrue = upperValue === "True";

            limits = lowerIsTrue ? booleanTrue.get(s).value : booleanFalse.get(s).value;
            limits += ` - ${upperIsTrue ? booleanTrue.get(s).value : booleanFalse.get(s).value}`;
        }

        const uomValue = uom.get(s).value;
        const uomString = uomValue ? ` [${uomValue}]` : "";
        const limitsString = limits + uomString;

        return limitsString;
    };

    const generateUpperLimitsStringForRowColumn = s => {
        let dataTypeValue = dataType.get(s).value;
        let lowerLimitValue = lowerLimit.get(s).value;
        let upperLimitValue = upperLimit.get(s).value;

        let lowerLimitString = "";
        let upperLimitString = "";

        if (dataTypeValue?.c[0] !== 7) {
            if (decimalScale.get(s).value !== undefined) {
                lowerLimitValue = persLowerLimit.get(s).value;
                upperLimitValue = persUpperLimit.get(s).value;
            }
            if (!lowerLimitValue.length) {
                upperLimitString = upperLimitValue;
            } else if (!upperLimitValue.length) {
                lowerLimitString = lowerLimitValue;
            } else {
                lowerLimitString = lowerLimitValue;
                upperLimitString = upperLimitValue;
            }
        } else {
            lowerLimitString = lowerLimitValue === "True" ? booleanTrue.get(s).value : booleanFalse.get(s).value;
            upperLimitString = upperLimitValue === "True" ? booleanTrue.get(s).value : booleanFalse.get(s).value;
        }

        return upperLimitString;
    };

    const generateLowerLimitsStringForRowColumn = s => {
        let dataTypeValue = dataType.get(s).value;
        let lowerLimitValue = lowerLimit.get(s).value;
        let upperLimitValue = upperLimit.get(s).value;

        let lowerLimitString = "";
        let upperLimitString = "";

        if (dataTypeValue?.c[0] !== 7) {
            if (decimalScale.get(s).value !== undefined) {
                lowerLimitValue = persLowerLimit.get(s).value;
                upperLimitValue = persUpperLimit.get(s).value;
            }
            if (!lowerLimitValue.length && !upperLimitValue.length) {
                lowerLimitString = "";
            } else if (!lowerLimitValue.length) {
                upperLimitString = upperLimitValue;
            } else if (!upperLimitValue.length) {
                lowerLimitString = lowerLimitValue;
            } else {
                lowerLimitString = lowerLimitValue;
                upperLimitString = upperLimitValue;
            }
        } else {
            lowerLimitString = lowerLimitValue === "True" ? booleanTrue.get(s).value : booleanFalse.get(s).value;
            upperLimitString = upperLimitValue === "True" ? booleanTrue.get(s).value : booleanFalse.get(s).value;
        }

        return lowerLimitString;
    };


    const generateUOMString = s => {
        let uomString = `${uom.get(s).value.length !== 0 ? " | UOM : " + uom.get(s).value : ""}`;
        return uomString;
    };

    const setGridPicklistOptions = columnIndex => {
        var picklistOptionsLocal = [];

        objectDataPointSelectionValuesList.current[columnIndex]?.length !== 0 &&
            objectDataPointSelectionValuesList.current[columnIndex]?.map(e => {
                let existing = picklistOptionsLocal.find(x => x.name == e.Name);
                var option = {
                    name: e.Name,
                    revision: e.Revision,
                    RevOfRcd: e.RevOfRcd,
                    InstanceId: e.InstanceId
                };
                if (existing) {
                    existing.child.push(option);
                } else {
                    picklistOptionsLocal.push(option);
                    picklistOptionsLocal[picklistOptionsLocal.length - 1].child = [];
                    picklistOptionsLocal[picklistOptionsLocal.length - 1].child.push(option);
                }
            });
        setpicklistOptions(picklistOptionsLocal);
    };
    const checkIsROR = (RevOfRcd, InstanceId) => {
        if (RevOfRcd == InstanceId) {
            return true;
        } else {
            return false;
        }
    };

    const handleDropdownVisibleChange = (s, columnIndex) => open => {
        console.dir("OPEN:", open);
        if (open) {
            callAPI(
                listName.get(s).value,
                selectedDataCollection,
                columnIndex,
                CDOBaseType.get(s).value == 1 ? "NDO" : "RDO"
            );
        } else {
            setpicklistOptions([]);
            objectDataPointSelectionValuesList.current[columnIndex] = [];
        }
    };
    const callAPI = (dataPointName, dataCollectionName, columnIndex, cdoBaseType) => {
        var xmlHttpRequest = new XMLHttpRequest();
        var url;
        if(zoomScale.value == '1.5')
        {
            url =
            serverUrl.value +
            "/shopfloor/api/ExecuteTask/GetListValuesFor(ParametricData.DataPointDetails." +
            cdoBaseType +
            "Value)";
        }
        else
        {
            url =
            serverUrl.value +
            "/shopfloor/api/CollectData/GetListValuesFor(ParametricData.DataPointDetails." +
            cdoBaseType +
            "Value)";
        }
        xmlHttpRequest.open("PUT", url, true);
        xmlHttpRequest.onload = () => {
            var selectionValues = [];
            var selectionValuesList = [...objectDataPointSelectionValuesList.current];
            if (xmlHttpRequest.status === 200 && cdoBaseType === "NDO") {
                var response = JSON.parse(xmlHttpRequest.responseText);
                response.map(e => {
                    selectionValues.push(e.Name);
                });
            }
            if (xmlHttpRequest.status === 200 && cdoBaseType === "RDO") {
                var response = JSON.parse(xmlHttpRequest.responseText);
                response.map(e => {
                    selectionValues.push(e);
                });
            }
            selectionValuesList[columnIndex] = selectionValues;
            setObjectDPSelectionValuesList(selectionValuesList);
            objectDataPointSelectionValuesList.current = selectionValuesList;
            if (cdoBaseType === "RDO") setGridPicklistOptions(columnIndex);
        };
        xmlHttpRequest.setRequestHeader("Content-Type", "application/json");
        xmlHttpRequest.setRequestHeader("Authorization", "Bearer " + bearerToken.value);
        var data = JSON.stringify({
            Container: {
                Name: containerName.value
            },
            ParametricData: {
                "@odata.type": "#shopfloor.DataPointSummary",
                DataPointDetails: [
                    {
                        "@odata.type": "#shopfloor.DataPointDetails",
                        DataPoint: {
                            "@odata.type": "#shopfloor.ObjectDataPoint",
                            Name: dataPointName,
                            //If user select parent data collection then we are setting UseROR as true
                            Parent: selectedDataCollectionIsROR == true ? {
                                "@odata.type": "#shopfloor.UserDataCollectionDef",
                                Name: dataCollectionName,
                                useROR: selectedDataCollectionIsROR
                            }
                                : {
                                    "@odata.type": "#shopfloor.UserDataCollectionDef",
                                    Name: dataCollectionName,
                                    Revision: selectedDataCollectionRevision
                                }
                        }
                    }
                ]
            }
        });
        xmlHttpRequest.send(data);
    };


    if (columns.items.length === 0) {
        return <div></div>;
    } else if (dataPointLayout.displayValue == 1) {
        return (
            <Paper
                className={`data-collection-widget-rowColumn ${dropDownValues.items && dropDownValues.items.length > 1 ? "" : "single-data-collection"
                    }`}
            >
                <TableContainer className={"grid-container-rowColumn"}>
                    <Table className={"grid-rowColumn"} style={{ display: "grid" }}>
                        <TableBody ref={wrapperRef} className={"grid-body"} style={{ display: "grid" }}>
                            {row.map((currentRow, rowIndex) => (
                                <TableRow
                                    className={`grid-body-row-rowColumn ${selectedRow === rowIndex ? "selected-row" : ""
                                        } rowColumn`}
                                    key={currentRow}
                                    onClick={() => {
                                        selectRow(rowIndex);
                                    }}
                                >
                                    {columns.items.map((currentColumn, columnIndex) => {
                                        return (
                                            <TableCell
                                                style={{
                                                    border: "none",
                                                    "grid-row": rowPosition.get(currentColumn).value,
                                                    "grid-column": columnPosition.get(currentColumn).value,
                                                    fontWeight: "700"
                                                }}
                                                key={currentRow + currentColumn.id}
                                                className={`grid-body-cell-rowColumn ${dataType.get(currentColumn).value?.c[0] === 6 ? "dateTimeMinWidth" : "minWidth"
                                                    }`}
                                            >
                                                <div style={{ display: "flow-root" }}>
                                                    <div className={"grid-body-cell-dataPointName-rowColumn"}>
                                                        {isRequired.get(currentColumn).value && <span className="required">*&nbsp;</span>}
                                                        {listName.get(currentColumn).value + generateUOMString(currentColumn)}

                                                    </div>

                                                    {displayLimits.get(dataList.items[0]).value && (
                                                        <div className={"grid-body-cell-upperlimit-rowColumn"}>
                                                            {generateUpperLimitsStringForRowColumn(currentColumn)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    {dataType.get(currentColumn).value?.c[0] === 5 ? (
                                                        displayMode.get(currentColumn).value?.c[0] === 4 ? (
                                                            <TextField
                                                                className={`grid-body-cell-textinput-rowColumn 
                                                                    ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""} `}
                                                                id={currentRow + currentColumn.id}
                                                                value={getTableDataValue(rowIndex, columnIndex)}
                                                                onChange={e => {
                                                                    handleTableDataChange(e, rowIndex, columnIndex);
                                                                }}
                                                                onFocus={e => {
                                                                    showQRCodeIcon(rowIndex, columnIndex, true);
                                                                    showErrorMessage(rowIndex, columnIndex, false);
                                                                    
                                                                }}
                                                                onBlur={e => {
                                                                    showQRCodeIcon(rowIndex, columnIndex, false);
                                                                    showErrorMessage(rowIndex, columnIndex, true);
                                                                }}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position="end">
                                                                            {
                                                                                isQRCodeIconVisible(rowIndex, columnIndex) ?
                                                                                    (
                                                                                        <BarcodeImage
                                                                                            triggerAction={(e) => handleQRCodeClick(currentColumn, rowIndex, columnIndex)}
                                                                                            cssClass={getCollectDataQRCodeCssClass(currentColumn)}
                                                                                        />
                                                                                    ) : null
                                                                            }
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                        ) : displayMode.get(currentColumn).value?.c[0] === 1 ? (
                                                            <div>
                                                                <Select
                                                                    className={`grid-body-cell-select-rowColumn 
                                                                                ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""}`}
                                                                    onOpen={() => {
                                                                        callAPI(
                                                                            listName.get(currentColumn).value,
                                                                            selectedDataCollection,
                                                                            columnIndex,
                                                                            CDOBaseType.get(currentColumn).value == 1 ? "NDO" : "RDO"
                                                                        );
                                                                    }}
                                                                    onFocus={e => {
                                                                        showQRCodeIcon(rowIndex, columnIndex, true);
                                                                        showErrorMessage(rowIndex, columnIndex, false);
                                                                    }}
                                                                    onChange={e => {
                                                                        handleTableDataChange(e, rowIndex, columnIndex);
                                                                    }}
                                                                    onBlur={e => {
                                                                        showQRCodeIcon(rowIndex, columnIndex, false);
                                                                        showErrorMessage(rowIndex, columnIndex, true);
                                                                    }}
                                                                    value={getTableDataValue(rowIndex, columnIndex)}
                                                                    id={currentRow + currentColumn.id}
                                                                >
                                                                    <MenuItem className="menu-item" value={""}>
                                                                        &nbsp;
                                                                    </MenuItem>
                                                                    {objectDataPointSelectionValuesList.current[columnIndex]?.length !==
                                                                        0 &&
                                                                        objectDataPointSelectionValuesList.current[columnIndex]?.map(e => {
                                                                            return (
                                                                                <MenuItem className="menu-item" value={e}>
                                                                                    {e}
                                                                                </MenuItem>
                                                                            );
                                                                        })}
                                                                </Select>
                                                                {
                                                                    isQRCodeIconVisible(rowIndex, columnIndex) ?
                                                                        (
                                                                            <BarcodeImage
                                                                                triggerAction={(e) => handleQRCodeClick(currentColumn, rowIndex, columnIndex)}
                                                                                cssClass={getCollectDataQRCodeCssClass(currentColumn, "dropDown")}
                                                                            />
                                                                        ) : null
                                                                }
                                                            </div>


                                                        ) : displayMode.get(currentColumn).value?.c[0] === 2 ? (
                                                            <div className="DataCollectionGrid-PicklistControl-rowColumn">
                                                                <TreeSelect
                                                                    className={`grid-body-cell-Treeselect-rowColumn
                                                                                 ${getValidatedTableDataValue(rowIndex, columnIndex)}
                                                                    `}
                                                                    id={currentRow + currentColumn.id}
                                                                    showSearch
                                                                    value={value}
                                                                    suffixIcon={
                                                                        <ArrowDropDownIcon className="picklist-ArrowDropDownIcon" />
                                                                    }
                                                                    allowClear
                                                                    //multiple
                                                                    //treeDefaultExpandAll
                                                                    //onChange={onChange}
                                                                    //onKeyDown={handleKeyDown}
                                                                    //onClear={onClear}
                                                                    onDropdownVisibleChange={handleDropdownVisibleChange(
                                                                        currentColumn,
                                                                        columnIndex
                                                                    )}
                                                                    onChange={newValue => {
                                                                        //setValue(newValue);
                                                                        setTableData(oldData => {
                                                                            const newData = [...oldData];
                                                                            newData[rowIndex] = [...newData[rowIndex]];
                                                                            //newData[rowIndex][columnIndex] = newValue.substring(0, newValue.indexOf(":"))
                                                                            newData[rowIndex][columnIndex] = newValue;
                                                                            return newData;
                                                                        });
                                                                    }}
                                                                    onFocus={e => {
                                                                        showErrorMessage(rowIndex, columnIndex, false);
                                                                    }}
                                                                    onBlur={e => {
                                                                        showErrorMessage(rowIndex, columnIndex, true);
                                                                    }}
                                                                >
                                                                    {objectDataPointSelectionValuesList.current[columnIndex]
                                                                        ?.length !== 0 &&
                                                                        picklistOptions.map(item => (                                                                            
                                                                            <TreeNode
                                                                                value={item.name + ":"}
                                                                                title={item.name}
                                                                            >                                                                                
                                                                                {item.child &&
                                                                                    item.child.map(child => (                                                                                                                                                                             
                                                                                        <TreeNode                                                                                       
                                                                                            value={
                                                                                                item.name +
                                                                                                ":" +
                                                                                                child.revision
                                                                                            }                                                                                            
                                                                                            title={
                                                                                                 <Tooltip title={item.name + ":" + child.revision}>  
                                                                                                <span>
                                                                                                    <span className="Picklist-element">
                                                                                                        {checkIsROR(
                                                                                                            child.RevOfRcd,
                                                                                                            child.InstanceId
                                                                                                        ) && (
                                                                                                                <CheckIcon className="Picklist-Checkicon" />
                                                                                                            )}
                                                                                                    </span>
                                                                                                    {item.name +
                                                                                                        ":" +
                                                                                                        child.revision}
                                                                                                </span>
                                                                                                 </Tooltip>  
                                                                                            }
                                                                                            key={
                                                                                                item.name +
                                                                                                ":" +
                                                                                                child.revision
                                                                                            }
                                                                                        ></TreeNode>                                                                                           
                                                                                    ))}                                                                                    
                                                                            </TreeNode>                                                                                                                                                
                                                                        ))}                                                                        
                                                                </TreeSelect>
                                                            </div>
                                                        ) : (
                                                            <TextField id={currentRow + currentColumn.id} />
                                                        )
                                                    ) : dataType.get(currentColumn).value?.c[0] === 6 ? (
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DateTimeField
                                                                id={currentRow + currentColumn.id}
                                                                className={`grid-body-cell-textinput-rowColumn
                                                            ${getValidatedTableDataValue(rowIndex, columnIndex)}`}
                                                                format={dateTimeFormat}
                                                                onChange={newValue => {
                                                                    setTableData(oldData => {
                                                                        const newData = [...oldData];
                                                                        newData[rowIndex] = [...newData[rowIndex]];
                                                                        newData[rowIndex][columnIndex] =
                                                                            Date.parse(newValue).toString();
                                                                        return newData;
                                                                    });
                                                                }}
                                                                inputProps={{
                                                                    onFocus: e => {
                                                                        showErrorMessage(rowIndex, columnIndex, false);
                                                                    },
                                                                    onBlur: e => {
                                                                        showErrorMessage(rowIndex, columnIndex, true);
                                                                    }
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    ) : dataType.get(currentColumn).value?.c[0] === 7 ? (
                                                        <Select
                                                            className={`grid-body-cell-select-rowColumn
                                                                        ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""}`}
                                                            onFocus={e => {
                                                                showErrorMessage(rowIndex, columnIndex, false);
                                                            }}
                                                            onChange={e => {
                                                                handleTableDataChange(e, rowIndex, columnIndex);
                                                            }}
                                                            onBlur={e => {
                                                                showErrorMessage(rowIndex, columnIndex, true);
                                                            }}
                                                            value={getTableDataValue(rowIndex, columnIndex)}
                                                            id={currentRow + currentColumn.id}
                                                        >
                                                            <MenuItem className="menu-item" value={""}>
                                                                &nbsp;
                                                            </MenuItem>
                                                            <MenuItem
                                                                className="menu-item"
                                                                value={booleanTrue.get(currentColumn).value}
                                                            >
                                                                {booleanTrue.get(currentColumn).value}
                                                            </MenuItem>
                                                            <MenuItem
                                                                className="menu-item"
                                                                value={booleanFalse.get(currentColumn).value}
                                                            >
                                                                {booleanFalse.get(currentColumn).value}
                                                            </MenuItem>
                                                        </Select>
                                                    ) : (
                                                        <TextField
                                                            className={`grid-body-cell-textinput-rowColumn
                                                                        ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""}`}
                                                            id={currentRow + currentColumn.id}
                                                            value={getTableDataValue(rowIndex, columnIndex)}
                                                            onChange={e => {
                                                                handleTableDataChange(e, rowIndex, columnIndex);
                                                            }}
                                                            onFocus={e => {
                                                                showQRCodeIcon(rowIndex, columnIndex, true);
                                                                showErrorMessage(rowIndex, columnIndex, false);
                                                            }}
                                                            onBlur={e => {
                                                                showQRCodeIcon(rowIndex, columnIndex, false);
                                                                showErrorMessage(rowIndex, columnIndex, true);
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="end">
                                                                        {
                                                                            isQRCodeIconVisible(rowIndex, columnIndex) ?
                                                                                (
                                                                                    <BarcodeImage
                                                                                        triggerAction={(e) => handleQRCodeClick(currentColumn, rowIndex, columnIndex)}
                                                                                        cssClass={getCollectDataQRCodeCssClass(currentColumn)}
                                                                                    />
                                                                                ) : null
                                                                        }
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    )}
                                                    {getValidationIcon(currentColumn, rowIndex, columnIndex, dataPointLayout.displayValue)}
                                                    {displayLimits.get(dataList.items[0]).value && (
                                                        <div className={"grid-body-cell-lowerlimit-rowColumn"}>
                                                            {generateLowerLimitsStringForRowColumn(currentColumn)}
                                                        </div>
                                                    )}
                                                    {renderErrorMessage(rowIndex, columnIndex, dataPointLayout.displayValue)}
                                                </div>
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    } else {
        return (
            <Paper
                className={`data-collection-widget ${dropDownValues.items && dropDownValues.items.length > 1 ? "" : "single-data-collection"
                    }`}
            >
                <div id="contextual-command-bar">
                    <CommandBarBtn Icon={AddIcon} text={"Add"} onClick={addMoreRows} />
                    <NumericInputField counter={rowsToAdd} setCounter={setRowsToAdd} />
                    <span className="rows-to-add-text">Rows</span>
                    <VerticalSeparator />
                    <CommandBarBtn Icon={TrashIcon} text={"Delete"} onClick={deleteSelectedRow} />
                    <VerticalSeparator />
                    <SwitchControl handleChange={handleTabbingChange} />
                </div>

                <TableContainer className={"grid-container"}>
                    <Table stickyHeader className={"grid"}>
                        <TableHead className={"grid-header"}>
                            <TableRow className={"grid-header-row"}>
                                <TableCell className={"grid-header-cell"}>Data Points</TableCell>

                                {columns.items.map(currentColumn => (
                                    <TableCell className={"grid-header-cell"} key={currentColumn.id}>
                                        {isRequired.get(currentColumn).value && <span className="required">*&nbsp;</span>}
                                        {listName.get(currentColumn).value}
                                    </TableCell>
                                ))}
                            </TableRow>

                            {displayLimits.get(dataList.items[0]).value && (
                                <TableRow className={"grid-header-row"}>
                                    <TableCell className={"grid-header-cell"}>Limits</TableCell>
                                    {columns.items.map(currentColumn => (
                                        <TableCell className={"grid-header-cell"} key={currentColumn.id}>
                                            {generateLimitsString(currentColumn)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )}
                        </TableHead>
                        <TableBody ref={wrapperRef} className={"grid-body"}>
                            {row.map((currentRow, rowIndex) => (
                                <TableRow
                                    className={`grid-body-row ${selectedRow === rowIndex ? "selected-row" : ""}`}
                                    key={currentRow}
                                    onClick={() => {
                                        selectRow(rowIndex);
                                        setselectedrowValueS(rowIndex);
                                    }}
                                >
                                    <TableCell component="th" scope="row" className={"grid-body-cell minWidth"}>
                                        Sample {rowIndex + 1}
                                    </TableCell>

                                    {columns.items?.map((currentColumn, columnIndex) => {
                                        return (
                                            <TableCell

                                                key={currentRow + currentColumn.id}
                                                className={`grid-body-cell ${dataType.get(currentColumn).value?.c[0] === 6 ? "dateTimeMinWidth" : "minWidth"
                                                    }`}
                                            >
                                                {dataType.get(currentColumn).value?.c[0] === 5 ? (
                                                    displayMode.get(currentColumn).value?.c[0] === 4 ? (
                                                        <TextField
                                                            className={`grid-body-cell-textinput 
                                                                    ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""}`}
                                                            id={currentRow + currentColumn.id}
                                                            value={getTableDataValue(rowIndex, columnIndex)}
                                                            onChange={e => {
                                                                handleTableDataChange(e, rowIndex, columnIndex);
                                                            }}
                                                            onFocus={e => {
                                                                showQRCodeIcon(rowIndex, columnIndex, true);
                                                                showErrorMessage(rowIndex, columnIndex, false);
                                                            }}
                                                            onBlur={e => {
                                                                showQRCodeIcon(rowIndex, columnIndex, false);
                                                                showErrorMessage(rowIndex, columnIndex, true);
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="end">
                                                                        {
                                                                            isQRCodeIconVisible(rowIndex, columnIndex) ?
                                                                                (
                                                                                    <BarcodeImage
                                                                                        triggerAction={(e) => handleQRCodeClick(currentColumn, rowIndex, columnIndex)}
                                                                                        cssClass={getCollectDataQRCodeCssClass(currentColumn)}
                                                                                    />
                                                                                ) : null
                                                                        }
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    ) : displayMode.get(currentColumn).value?.c[0] === 1 ? (
                                                        <div>
                                                            <Select
                                                                className={`grid-body-cell-select 
                                                                                ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""}`}
                                                                onOpen={() => {
                                                                    callAPI(
                                                                        listName.get(currentColumn).value,
                                                                        selectedDataCollection,
                                                                        columnIndex,
                                                                        CDOBaseType.get(currentColumn).value == 1 ? "NDO" : "RDO"
                                                                    );
                                                                }}
                                                                onFocus={e => {
                                                                    showQRCodeIcon(rowIndex, columnIndex, true);
                                                                    showErrorMessage(rowIndex, columnIndex, false);
                                                                }}
                                                                onChange={e => {
                                                                    handleTableDataChange(e, rowIndex, columnIndex);
                                                                }}
                                                                onBlur={e => {
                                                                    showQRCodeIcon(rowIndex, columnIndex, false);
                                                                    showErrorMessage(rowIndex, columnIndex, true);
                                                                }}
                                                                value={getTableDataValue(rowIndex, columnIndex)}
                                                                id={currentRow + currentColumn.id}
                                                            >
                                                                <MenuItem className="menu-item" value={""}>
                                                                    &nbsp;
                                                                </MenuItem>
                                                                {objectDataPointSelectionValuesList.current[columnIndex]
                                                                    ?.length !== 0 &&
                                                                    objectDataPointSelectionValuesList.current[
                                                                        columnIndex
                                                                    ]?.map(e => {
                                                                        return (
                                                                            <MenuItem className="menu-item" value={e}>
                                                                                {e}
                                                                            </MenuItem>
                                                                        );
                                                                    })}
                                                            </Select>
                                                            {
                                                                isQRCodeIconVisible(rowIndex, columnIndex) ?
                                                                    (
                                                                        <BarcodeImage
                                                                            triggerAction={(e) => handleQRCodeClick(currentColumn, rowIndex, columnIndex)}
                                                                            cssClass={"right60"}
                                                                        />
                                                                    ) : null
                                                            }
                                                        </div>
                                                    ) : displayMode.get(currentColumn).value?.c[0] === 2 ? (
                                                        <div className="DataCollectionGrid-PicklistControl">
                                                            <TreeSelect
                                                                className={`grid-body-cell-Treeselect 
                                                                                    ${getValidatedTableDataValue(rowIndex, columnIndex)}
                                                                        `}
                                                                id={currentRow + currentColumn.id}
                                                                showSearch
                                                                value={value}
                                                                suffixIcon={
                                                                    <ArrowDropDownIcon className="picklist-ArrowDropDownIcon" />
                                                                }
                                                                allowClear
                                                                //multiple
                                                                //treeDefaultExpandAll
                                                                //onChange={onChange}
                                                                //onKeyDown={handleKeyDown}
                                                                //onClear={onClear}
                                                                onDropdownVisibleChange={handleDropdownVisibleChange(
                                                                    currentColumn,
                                                                    columnIndex
                                                                )}
                                                                onChange={newValue => {
                                                                    //setValue(newValue);
                                                                    setTableData(oldData => {
                                                                        const newData = [...oldData];
                                                                        newData[rowIndex] = [...newData[rowIndex]];
                                                                        //newData[rowIndex][columnIndex] = newValue.substring(0, newValue.indexOf(":"))
                                                                        newData[rowIndex][columnIndex] = newValue;
                                                                        return newData;
                                                                    });
                                                                }}
                                                                onFocus={e => {
                                                                    showErrorMessage(rowIndex, columnIndex, false);
                                                                }}
                                                                onBlur={e => {
                                                                    showErrorMessage(rowIndex, columnIndex, true);
                                                                }}
                                                            >
                                                                {objectDataPointSelectionValuesList.current[columnIndex]
                                                                    ?.length !== 0 &&
                                                                    picklistOptions.map(item => (                                                                        
                                                                        <TreeNode
                                                                            value={item.name + ":"}
                                                                            title={item.name}
                                                                        >                                                                           
                                                                            {item.child &&
                                                                                item.child.map(child => (                                                                                                                                                                                                                                                           <TreeNode                                                                                   
                                                                                        value={
                                                                                            item.name +
                                                                                            ":" +
                                                                                            child.revision
                                                                                        }
                                                                                        title={
                                                                                            <Tooltip title={item.name + ":" + child.revision}> 
                                                                                            <span>
                                                                                                <span className="Picklist-element">
                                                                                                    {checkIsROR(
                                                                                                        child.RevOfRcd,
                                                                                                        child.InstanceId
                                                                                                    ) && (
                                                                                                            <CheckIcon className="Picklist-Checkicon" />
                                                                                                        )}
                                                                                                </span>
                                                                                                {item.name +
                                                                                                    ":" +
                                                                                                    child.revision}
                                                                                            </span>
                                                                                            </Tooltip>
                                                                                        }
                                                                                        key={
                                                                                            item.name +
                                                                                            ":" +
                                                                                            child.revision
                                                                                        }                                                                                                                                                                               
                                                                                    ></TreeNode>                                                                                    
                                                                                ))}                                                                              
                                                                        </TreeNode>                                                                        
                                                                    ))}
                                                            </TreeSelect>
                                                        </div>
                                                    ) : (
                                                        <TextField id={currentRow + currentColumn.id} />
                                                    )
                                                ) : dataType.get(currentColumn).value?.c[0] === 6 ? (
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DateTimeField
                                                            id={currentRow + currentColumn.id}
                                                            className={`grid-body-cell-textinput
                                                                ${getValidatedTableDataValue(rowIndex, columnIndex)}`}
                                                            format={dateTimeFormat}
                                                            onChange={newValue => {
                                                                setTableData(oldData => {
                                                                    const newData = [...oldData];
                                                                    newData[rowIndex] = [...newData[rowIndex]];
                                                                    newData[rowIndex][columnIndex] =
                                                                        Date.parse(newValue).toString();
                                                                    return newData;
                                                                });
                                                            }}
                                                            inputProps={{
                                                                onFocus: e => {
                                                                    showErrorMessage(rowIndex, columnIndex, false);
                                                                },
                                                                onBlur: e => {
                                                                    showErrorMessage(rowIndex, columnIndex, true);
                                                                }
                                                            }}
                                                        />
                                                    </LocalizationProvider>
                                                ) : dataType.get(currentColumn).value?.c[0] === 7 ? (
                                                    <Select
                                                        className={`grid-body-cell-select 
                                                                ${getValidatedTableDataValue(rowIndex, columnIndex)}
                                                                `}
                                                        onFocus={e => {
                                                            showErrorMessage(rowIndex, columnIndex, false);
                                                        }}
                                                        onChange={e => {
                                                            handleTableDataChange(e, rowIndex, columnIndex);
                                                        }}
                                                        onBlur={e => {
                                                            showErrorMessage(rowIndex, columnIndex, true);
                                                        }}
                                                        value={getTableDataValue(rowIndex, columnIndex)}
                                                        id={currentRow + currentColumn.id}
                                                    >
                                                        <MenuItem className="menu-item" value={""}>
                                                            &nbsp;
                                                        </MenuItem>
                                                        <MenuItem
                                                            className="menu-item"
                                                            value={booleanTrue.get(currentColumn).value}
                                                        >
                                                            {booleanTrue.get(currentColumn).value}
                                                        </MenuItem>
                                                        <MenuItem
                                                            className="menu-item"
                                                            value={booleanFalse.get(currentColumn).value}
                                                        >
                                                            {booleanFalse.get(currentColumn).value}
                                                        </MenuItem>
                                                    </Select>
                                                ) : (
                                                    <TextField
                                                        className={`grid-body-cell-textinput
                                                                        ${isValidationErrorVisible(rowIndex, columnIndex) ? getValidatedTableDataValue(rowIndex, columnIndex) : ""}`}
                                                        id={currentRow + currentColumn.id}
                                                        value={getTableDataValue(rowIndex, columnIndex)}
                                                        onChange={e => {
                                                            handleTableDataChange(e, rowIndex, columnIndex);
                                                        }}
                                                        onFocus={e => {
                                                            showQRCodeIcon(rowIndex, columnIndex, true);
                                                            showErrorMessage(rowIndex, columnIndex, false);
                                                        }}
                                                        onBlur={e => {
                                                            showQRCodeIcon(rowIndex, columnIndex, false);
                                                            showErrorMessage(rowIndex, columnIndex, true);
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="end">
                                                                    {
                                                                        isQRCodeIconVisible(rowIndex, columnIndex) ?
                                                                            (
                                                                                <BarcodeImage
                                                                                    triggerAction={(e) => handleQRCodeClick(currentColumn, rowIndex, columnIndex)}
                                                                                />
                                                                            ) : null
                                                                    }
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                                {getValidationIcon(currentColumn, rowIndex, columnIndex, dataPointLayout.displayValue)}
                                                {renderErrorMessage(rowIndex, columnIndex, dataPointLayout.displayValue)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        );
    }
}
export default hot(DataCollectionGrid);
