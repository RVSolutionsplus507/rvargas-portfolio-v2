
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export const LanguageButton = ({ className }) => {
    const { i18n } = useTranslation();
    const isEs = i18n.language?.startsWith("es");

    const toggle = () => {
        const next = isEs ? "en" : "es";
        i18n.changeLanguage(next);
        localStorage.setItem("language", next);
    };

    return (
        <button
            onClick={toggle}
            aria-label={isEs ? "Switch to English" : "Cambiar a Español"}
            className={"text-2xl leading-none hover:scale-110 active:scale-95 transition-transform duration-150 z-50 " + (className || "")}
        >
            {isEs ? "🇪🇸" : "🇺🇸"}
        </button>
    );
};

LanguageButton.propTypes = {
    className: PropTypes.string
};
