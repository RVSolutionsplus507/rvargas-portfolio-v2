import { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "@/context/darkmodecontext";
import "@/css/darkmode.css";

export const Darkmode = ({ className = "" }) => {
    const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

    return (
        <div
            className={`tdnn ${isDarkMode ? "" : "day"} ${className}`}
            onClick={toggleDarkMode}
        >
            <div className={`moon ${isDarkMode ? "" : "sun"}`}></div>
        </div>
    );
};

Darkmode.propTypes = {
    className: PropTypes.string
};