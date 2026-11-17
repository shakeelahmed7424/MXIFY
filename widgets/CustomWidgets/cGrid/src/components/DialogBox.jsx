import * as React from "react";
import { createElement, useState, useEffect } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import "../ui/DialogBox.scss";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

export default function DialogBox({ ShouldDialogShow, handleClose, handleOk }) {
    //console.log("Rendering dialogBox...", ShouldDialogShow);
    const [openDialog, setOpenDialog] = React.useState(ShouldDialogShow);

    useEffect(() => {
        setOpenDialog(ShouldDialogShow);
    }, [ShouldDialogShow]);

    const handleCancel = () => {
        
        handleClose();
    };

    const handleConfirm = () => {
        handleOk();
    };

    // const openDialogBox = () => {
    //    handleDisplay(ShouldDialogShow);
    // };

    return (
        <>
            <Dialog open={openDialog} className="confirmation-dialog-box">
                <div className={"dialogBox-header"}>
                   
                    <img
                        src="./img/cmdClose16.svg"
                        className={"dialogBox-header-closeButton"}
                        onClick={handleClose}
                    ></img>
                    <h4 className={"dialogBox-title"}>Unsaved Data</h4>
                    <img src="./img/indicatorWarningTriangleRed16.svg" className={"dialogBox-error-img"}></img>
                </div>

                <div className={"dialogBox-text"}>
                    The data collection contains unsaved data. Are you sure you want to select a new data collection
                    definition?{" "}
                    <div className={"dialogBox-buttons-div"}>
                        <button className={"dialogBox-cancelButton"} onClick={handleClose}>
                            Cancel
                        </button>
                        <button className={"dialogBox-confirmButton"} onClick={handleOk}>
                            Yes
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
