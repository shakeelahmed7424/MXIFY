import { createElement } from "react";
import "../ui/CommandBarBtn.scss";

export default function CommandBarBtn({ Icon, text, onClick }) {
    return (
        <div
            style={{}}
            className="command-bar-btn"
            onClick={onClick}
            tabIndex={"1"}
            onKeyDown={event => {
                event.key === "Enter" && onClick();
            }}
        >
            <Icon className={"btn-icon"} />
            <span style={{}} className="btn-text">
                {text}
            </span>
        </div>
    );
}
