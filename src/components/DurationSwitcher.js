import React from "react";
import { useTranslation } from "react-i18next";
import "./DurationSwitcher.css"

const DurationSwitcher = ({handleChangeCallback}, {defaultDuration}) => {

    const { i18n, t } = useTranslation();

    const DURATIONS = [
        { label: "30 " + t("days"), code: 30 },
        { label: "60 " + t("days"), code: 60 },
        { label: "90 " + t("days"), code: 90 },
    ];

    return (
        <select className="duration_switcher" defaultValue={defaultDuration} onChange={handleChangeCallback}>
            {DURATIONS.map(({ code, label }) => (
                <option key={code} value={code}>
                    {label}
                </option>
            ))}
        </select>
    );
};

export default DurationSwitcher;
