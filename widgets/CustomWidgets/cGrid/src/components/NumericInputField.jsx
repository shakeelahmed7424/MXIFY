import { createElement, useState } from "react";
import TextField from "@mui/material/TextField";
import { MinusIcon, PlusIcon } from "./Icons";
import "../ui/NumericInputField.scss";

export default function NumericInputField({ counter, setCounter }) {
    return (
        <div className="numeric-input-field">
            <div
                className="minus-btn-container"
                onClick={() => {
                    if (counter > 1) setCounter(counter - 1);
                }}
                // tabIndex={"1"}
            >
                <MinusIcon />
            </div>
            <TextField
                style={{}}
                className={"textinput_new"}
                value={counter}
                onChange={e => {
                    const regEx = /^[0-9\b]+$/;

                    if (e.target.value !== "" || regEx.test(e.target.value)) {
                        setCounter(parseInt(e.target.value));
                    }
                }}
                inputProps={{ tabIndex: "1" }}
            />
            <div
                className="plus-btn-container"
                onClick={() => {
                    setCounter(counter + 1);
                }}
                // tabIndex={"1"}
            >
                <PlusIcon />
            </div>
        </div>
    );
}
