import { useState, useEffect, createElement } from "react";
import { hot } from "react-hot-loader/root";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import DirectionsIcon from "@mui/icons-material/Directions";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DangerousIcon from "@mui/icons-material/Dangerous";
import InputAdornment from "@mui/material/InputAdornment";

function createData(serial) {
    return { serial };
}

const useStyles = makeStyles({
    table: {
        minWidth: 300,
        "& .MuiTableCell-root": {
            border: "1px solid black"
        }
    },
    root: {
        "& .MuiTableCell-head": {
            color: "white",
            backgroundColor: "blue"
        },

        tableHead: {
            "& 	.MuiFormControl-root": {
                padding: "10px"
            }
        },

        dgscroll: {
            overflowY: "auto",
            "&::-webkit-scrollbar": {
                width: "0.4em"
            },
            "&::-webkit-scrollbar-track": {
                boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
                webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)"
            },
            "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,.1)"
            }
        },

        sticky: {
            position: "sticky"
        },

        overLimit: {
            backgroundColor: "red"
        },

        withinLimit: {
            backgroundColor: "green"
        }
    }
});

const sampleDict = {
    value: 0,
    index: 0,
    sample: 0
};

function DataCollectionGrid({
    historyValue,
    dataList,
    listName,
    upperLimit,
    lowerLimit,
    rowCount,
    uom,
    collectAction,
    enteredAmount,
    historyList
}) {
    const [columns, setColumns] = useState(dataList);
    const [selectedValue, setSelectedValue] = useState("h");
    const [row, setRow] = useState([]);
    const [disableList, setDisableList] = useState([]);
    const [value, setValue] = useState("");
    const [samp, setSamp] = useState([]);

    let z = -1;

    useEffect(() => {
        createArray();
        let arr = [];
        let j = 0;
        let sample = 1;
        for (let i = 0; i < historyList.items.length; i++) {
            let ob = { value: 0, index: 0, sample: 0 };
            ob.value = historyValue.get(historyList.items[i]).value;

            ob.index = j;
            ob.sample = sample;
            arr.push(ob);
            j++;

            if (j === columns.items.length) {
                sample++;
                j = 0;
            }
        }

        setSamp([...samp, ...arr]);
    }, []);

    useEffect(() => {
        console.log(samp);
    }, [samp]);

    useEffect(() => {
        console.log("Disabled list: " + disableList);
    }, [disableList]);

    useEffect(() => {
        const dataList = [];
        let c = 0;
        let d = 0;
        for (let i = 1; i < row.length + 1; i++) {
            for (let j = 0; j < columns.items.length; j++) {
                if (historyList.items[c] != null) {
                    d = i;
                }
                c++;
            }
            if (d === i) {
                dataList.push(d);
            }
            d = 0;
        }
        setDisableList([...disableList, ...dataList]);
    }, [row]);

    useEffect(() => {
        setColumns(dataList);
    }, [dataList]);

    const createArray = () => {
        let rows = Array.from({ length: rowCount.value }, (value, index) => index + 1);
        const newSamples = rows.map(item => item);
        setRow([...row, ...newSamples]);
    };

    const addMoreRows = () => {
        console.log("adding " + value + " rows");
        let start = parseInt(row[row.length - 1], 10) + 1;
        console.log("Start " + start);
        let end = parseInt(value, 10) + start;
        console.log("End " + end);
        let arr = [];
        for (let i = start; i < end; i++) {
            arr.push(i);
        }
        setRow([...row, ...arr]);
        setValue("");
        const f = document.getElementById(columns.items[0].id + 1);
        f.focus();
    };

    const radioChange = event => {
        setSelectedValue(event.target.value);

        let cellCount = 1;
        if (event.target.value === "v") {
            for (let i = 0; i < columns.items.length; i++) {
                //in the grid each unique cell is the cocat of guid from mendix + serial number for vertical we need to get every row per test
                for (let j = 0; j < row.length; j++) {
                    const cellLocation = columns.items[i].id + (j + 1);
                    const vcell = document.getElementById(cellLocation);
                    vcell.tabIndex = cellCount++;
                }
            }
        } else {
            for (let j = 0; j < row.length; j++) {
                for (let i = 0; i < columns.items.length; i++) {
                    //in the grid each unique cell is the cocat of guid from mendix + serial number for horozontial we need to get every item per row
                    const cellLocation = columns.items[i].id + (j + 1);
                    const hcell = document.getElementById(cellLocation);
                    hcell.tabIndex = cellCount++;
                }
            }
        }
    };

    const classes = useStyles();

    function handleChange(serial, objectID, event, index) {
        const upper = Number(upperLimit.get(objectID).value);
        const lower = Number(lowerLimit.get(objectID).value);
        const action = collectAction.get(objectID);

        if (event.target.value !== "") {
            let arr = [];
            let ob = { value: 0, index: 0, sample: 0 };
            ob.value = event.target.value;
            ob.sample = serial;
            ob.index = index;
            arr.push(ob);
            setSamp([...samp, ...arr]);

            let v = disableList.find(element => element === serial);
            if (v === undefined) {
                let a = [serial];
                setDisableList([...disableList, ...a]);
            }

            enteredAmount.setValue(event.target.value);
            action.execute();
        }
    }

    if (columns.items.length === 0) {
        return <div>Empty Data</div>;
    } else {
        return (
            <Paper className={classes.dgscroll} sx={{ width: "100%", mb: 2 }}>
                <FormControl sx={{ flexDirection: "row", padding: "10px" }} className={classes.tableHead}>
                    <FormLabel
                        id="row-radio-buttons-group-label"
                        sx={{ fontSize: "16px", fontWeight: "bold", lineHeight: "2.2" }}
                    >
                        Tabbing
                    </FormLabel>
                    <RadioGroup
                        row
                        aria-labelledby="row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={selectedValue}
                        onChange={radioChange}
                    >
                        <FormControlLabel
                            componentsProps={{ typography: { variant: "h6" } }}
                            value="v"
                            control={<Radio />}
                            label="Vertical"
                            sx={{ fontSize: "14px" }}
                        />
                        <FormControlLabel
                            componentsProps={{ typography: { variant: "h6" } }}
                            value="h"
                            control={<Radio />}
                            label="Horozontial"
                            sx={{ fontSize: "14px" }}
                        />
                    </RadioGroup>

                    <Paper component="form" sx={{ p: "2px 4px", display: "flex", alignItems: "center", width: 200 }}>
                        <InputBase
                            sx={{ ml: 1, flex: 1, fontSize: "18px" }}
                            placeholder="Add Samples"
                            inputProps={{ "aria-label": "Add Samples" }}
                            onChange={event => setValue(event.target.value)}
                            value={value}
                        />
                        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                        <IconButton
                            color="primary"
                            sx={{ p: "10px", fontSize: "16px" }}
                            aria-label="directions"
                            onClick={addMoreRows}
                        >
                            <DirectionsIcon />
                        </IconButton>
                    </Paper>
                </FormControl>

                <TableContainer
                    sx={{
                        width: "100%",
                        mb: 2,
                        overflow: "auto",
                        scrollbarWidth: "thin",
                        "&::-webkit-scrollbar": {
                            width: "0.4em",
                            backgroundColor: "#F5F5F5"
                        },
                        "&::-webkit-scrollbar-track": {
                            webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
                            borderRadius: "10px",
                            backgroundColor: "#F5F5F5"
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: "#555",
                            webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
                            borderRadius: "10px"
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                            opacity: "0.5"
                        }
                    }}
                >
                    <Table className={classes.table} aria-label="simple table" size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{ fontWeight: "bold", fontSize: "16px" }} width="10%" align="left">
                                    Test
                                </TableCell>

                                {columns.items.map(s => (
                                    <TableCell key={s.id} style={{ fontSize: "16px" }} align="center">
                                        {listName.get(s).value}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                <TableCell
                                    width="10%"
                                    style={{ minWidth: "170px", fontWeight: "bold", fontSize: "16px" }}
                                >
                                    Limits
                                </TableCell>

                                {columns.items.map(s => (
                                    <TableCell key={s.id} width="10%" style={{ fontSize: "16px" }} align="center">
                                        {lowerLimit.get(s).value} - {upperLimit.get(s).value} {uom.get(s).value}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {row.map(r => (
                                <TableRow key={r} sx={{ "&:last-child td, &:last-child th": { borderBottom: 0 } }}>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        size="small"
                                        style={{ fontSize: "16px" }}
                                        align="left"
                                    >
                                        {disableList.find(element => element === r) != null ? (
                                            <IconButton
                                                color="warning"
                                                tabIndex={"-1"}
                                                sx={{ p: "5px" }}
                                                aria-label="directions"
                                                disabled={true}
                                            >
                                                {" "}
                                                <DeleteForeverIcon fontSize="large" />{" "}
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                color="primary"
                                                tabIndex={"-1"}
                                                sx={{ p: "5px" }}
                                                aria-label="directions"
                                                onClick={() => {
                                                    setRow(row.filter(ri => ri !== r));
                                                }}
                                            >
                                                {" "}
                                                <DeleteForeverIcon fontSize="large" />{" "}
                                            </IconButton>
                                        )}
                                        Sample #{r}
                                    </TableCell>

                                    {columns.items.map((s, index) => {
                                        z++;

                                        return (
                                            <TableCell
                                                key={s.id}
                                                size="small"
                                                style={{ width: "170px", fontSize: "16px" }}
                                                align="center"
                                            >
                                                {samp.find(
                                                    element => (element.sample === r && element.index) === index
                                                ) != undefined ? (
                                                    <div style={{ display: "flex" }}>
                                                        <TextField
                                                            style={{ backgroundColor: "lightblue" }}
                                                            id={s.id + r}
                                                            variant="outlined"
                                                            size="small"
                                                            inputProps={{
                                                                style: { fontSize: "16px", fontWeight: "bold" },
                                                                tabIndex: "1"
                                                            }}
                                                            disabled={true}
                                                            value={
                                                                samp.find(
                                                                    element =>
                                                                        element.sample === r && element.index === index
                                                                ).value
                                                            }
                                                        />{" "}
                                                        {Number(
                                                            samp.find(
                                                                element =>
                                                                    element.sample === r && element.index === index
                                                            ).value
                                                        ) > Number(upperLimit.get(s).value) ||
                                                        Number(lowerLimit.get(s).value) >
                                                            Number(
                                                                samp.find(
                                                                    element =>
                                                                        element.sample === r && element.index === index
                                                                ).value
                                                            ) ? (
                                                            <DangerousIcon
                                                                color={"error"}
                                                                style={{
                                                                    alignSelf: "center",
                                                                    marginLeft: "5px",
                                                                    width: "20px",
                                                                    height: "20px"
                                                                }}
                                                            />
                                                        ) : (
                                                            <CheckCircleOutlineIcon
                                                                color={"success"}
                                                                style={{
                                                                    alignSelf: "center",
                                                                    marginLeft: "5px",
                                                                    width: "20px",
                                                                    height: "20px"
                                                                }}
                                                            />
                                                        )}{" "}
                                                    </div>
                                                ) : (
                                                    <TextField
                                                        id={s.id + r}
                                                        variant="outlined"
                                                        size="small"
                                                        inputProps={{ style: { fontSize: 16 }, tabIndex: "1" }}
                                                        onBlur={evt => handleChange(r, s, evt, index)}
                                                    />
                                                )}
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
