import React from "react";
import { useTranslation } from "react-i18next";

import { LANGUAGES } from "../util/StringUtils";

const LanguageSwitcher = () => {

    const { i18n } = useTranslation();

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
    };

    return (
        <select className="language_selector" defaultValue={i18n.language} onChange={handleLanguageChange}>
            {LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code}>
                    {label}
                </option>
            ))}
        </select>
    );
};

export default LanguageSwitcher;
