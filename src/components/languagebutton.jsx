
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export const LanguageButton = ({ className }) => {
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language || "es");
    
    // Asegurarse de que el estado refleje el idioma actual
    useEffect(() => {
        // Comprobar si el idioma actual incluye 'en' (por ejemplo 'en-US' o 'en')
        const isEnglish = i18n.language.startsWith("en");
        setCurrentLang(isEnglish ? "en" : "es");
    }, [i18n.language]);
    
    const toggleLanguage = () => {
        const newLang = currentLang === "es" ? "en" : "es";
        i18n.changeLanguage(newLang);
        setCurrentLang(newLang);
        localStorage.setItem("language", newLang);
    };
    
    return (
        <button className={"z-50 " + className} onClick={toggleLanguage}>
            <img
                className="w-7 h-5"
                src={
                    currentLang === "en"
                        ? "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/300px-Flag_of_the_United_States.svg.png"
                        : "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Bandera_de_Espa%C3%B1a.svg/300px-Bandera_de_Espa%C3%B1a.svg.png"
                } 
                style={{ borderRadius: "3px" }}
                alt={currentLang === "en" ? "English" : "Español"}
            />
        </button>
    );
};

LanguageButton.propTypes = {
    className: PropTypes.string
};
