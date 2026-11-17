import { createElement, useState, useEffect } from "react";
import Switch from "@mui/material/Switch";
import "../ui/SwitchControl.scss";

export default function SwitchControl({ handleChange }) {
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        handleChange(checked);
    }, [checked]);

    return (
        <div className="switch-control-group">
            <div className="switch-control-container">
                <Switch
                    checked={checked}
                    onChange={event => {
                        setChecked(event.target.checked);
                    }}
                    className="switch-control"
                    inputProps={{
                        tabIndex: "1",
                        onKeyDown: event => {
                            if (event.key === "Enter") {
                                setChecked(!event.target.checked);
                            }
                        }
                    }}
                />
            </div>
            <span className="switch-control-label">Vertical Tab</span>
        </div>
    );
}
