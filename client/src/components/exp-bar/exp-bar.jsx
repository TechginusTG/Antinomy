import React from "react";
import styles from "./exp-bar.module.css";
import useFlowStore from "../../utils/flowStore"; 

function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
}

const ExpBar = () => {
    const { currentExp, maxExp, level } = useFlowStore(); 

    const expPercentage = (currentExp / maxExp) * 100;

    return (
        <div className={styles["exp-bar"]}>
            <div
                className={styles["exp-bar-fill"]}
                style={{ width: `${expPercentage}%` }}
            />
            <span className={styles["exp-bar-label"]}>Lv {level} / Exp {round((currentExp)/(maxExp) * 100, 1)}%</span>
        </div>
    );
};

export default React.memo(ExpBar);
