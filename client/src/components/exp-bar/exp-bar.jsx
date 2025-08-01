import React, { useState, useCallback } from "react";
import { Button } from "antd";
import styles from "./exp-bar.module.css";

const ExpBar = () => {
    const [exp, setExp] = useState(0);
    const [level, setLevel] = useState(1);

    const increaseExp = useCallback((d) => {
        setExp((prevExp) => {
            let totalExp = prevExp + d;
            let levelUps = 0;
            while (totalExp >= 100) {
                totalExp -= 100;
                levelUps += 1;
            }
            if (levelUps > 0) {
                setLevel((prevLevel) => prevLevel + levelUps);
            }
            return totalExp;
        });
    }, []);

    const handleExpUp = useCallback(() => increaseExp(10), [increaseExp]);

    return (
        <div className={styles["exp-bar"]}>
            <div
                className={styles["exp-bar-fill"]}
                style={{ width: `${exp}%` }}
            />
            <span className={styles["exp-bar-label"]}>Lv {level} / Exp {Math.round(exp)}%</span>
            <div className={styles["levelup-button"]}>
                <Button type="default" onClick={handleExpUp}>
                    Exp UP
                </Button>
            </div>
        </div>
    );
};

export default ExpBar;
