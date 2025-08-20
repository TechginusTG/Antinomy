import React, { useState, useCallback } from "react";
import styles from "./exp-bar.module.css";

const ExpBar = () => {
    const [exp, setExp] = useState(0);
    const [level, setLevel] = useState(1);

    return (
        <div className={styles["exp-bar"]}>
            <div
                className={styles["exp-bar-fill"]}
                style={{ width: `${exp}%` }}
            />
            <span className={styles["exp-bar-label"]}>Lv {level} / Exp {Math.round(exp)}%</span>
        </div>
    );
};

export default React.memo(ExpBar);
