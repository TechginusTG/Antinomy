import React from "react";
import styles from "./exp-bar.module.css";
import useUserStore from "../../utils/userStore";

function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

const ExpBar = () => {
    const { exp: currentExp, lvl: level } = useUserStore();
    const maxExp = level * 100;

    const expPercentage = maxExp > 0 ? (currentExp / maxExp) * 100 : 0;

    return (
        <div className={styles["exp-bar"]}>
            <div
                className={styles["exp-bar-fill"]}
                style={{ width: `${expPercentage}%` }}
            />
            <span className={styles["exp-bar-label"]}>
                Lv {level} / Exp {round(expPercentage, 1)}%
            </span>
        </div>
    );
};

export default React.memo(ExpBar);