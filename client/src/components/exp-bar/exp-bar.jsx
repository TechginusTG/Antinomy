import React, { useState } from "react";
import styles from "./exp-bar.module.css";
import useUserStore from "../../utils/userStore";

function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

const ExpBar = () => {
    const { exp: currentExp, lvl: level } = useUserStore();
    const maxExp = level * 100;
    const expPercentage = maxExp > 0 ? (currentExp / maxExp) * 100 : 0;

    const [tooltip, setTooltip] = useState({ visible: false, x: 0 });

    const handleMouseMove = (e) => {
        setTooltip(prev => ({ ...prev, x: e.clientX }));
    };

    const handleMouseEnter = () => {
        setTooltip(prev => ({ ...prev, visible: true }));
    };

    const handleMouseLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
    };

    return (
        <>
            <div
                className={styles["exp-bar"]}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
            >
                <div
                    className={styles["exp-bar-fill"]}
                    style={{ width: `${expPercentage}%` }}
                />
                <span className={styles["exp-bar-label"]}>
                    Lv {level} / Exp {round(expPercentage, 1)}%
                </span>
            </div>
            {tooltip.visible && (
                <div
                    className={styles["exp-tooltip"]}
                    style={{
                        position: 'fixed',
                        left: `${tooltip.x + 15}px`,
                        bottom: '1rem',
                    }}
                >
                    {Math.floor(currentExp)} / {maxExp}
                </div>
            )}
        </>
    );
};

export default React.memo(ExpBar);