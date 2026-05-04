import { useState, useEffect } from "react";
import styles from './NixieClock.module.css';

const NixieClock = () => {
    const [isOff, setIsOff] = useState(false);
    const [displayChars, setDisplayChars] = useState(Array(12).fill("0"));

    useEffect(() => {
        const update = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, "0");
            let amPm = hours >= 12 ? "PM" : "AM";
            if (hours > 12) hours -= 12;
            if (hours === 0) hours = 12;
            let timeStr = hours.toString().padStart(2, "0") + minutes;
            if (timeStr.startsWith("0")) timeStr = " " + timeStr.slice(1);

            let month = (now.getMonth() + 1).toString().padStart(2, "0");
            let day = now.getDate().toString().padStart(2, "0");
            const year = now.getFullYear().toString().slice(-2);
            if (month.startsWith("0")) month = " " + month.slice(1);
            if (day.startsWith("0")) day = " " + day.slice(1);

            const full = timeStr + amPm + month + day + year;
            setDisplayChars(full.split(""));
        };

        update();
        const timer = setInterval(update, 60000);
        return () => clearInterval(timer);
    }, []);

    const toggle = () => setIsOff((prev) => !prev);

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.clock} ${isOff ? styles.off : ""}`}>
                {/* SVG 噪声纹理 – 改用 className 匹配模块化样式 */}
                <svg className={styles.noiseSvg}>
                    <filter id="noiseFilter">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="1.5"
                            numOctaves="3"
                            stitchTiles="stitch"
                        />
                    </filter>
                    <rect className={styles.noiseRect} filter="url(#noiseFilter)" />
                </svg>

                <div className={styles.shadow} />

                <div className={styles["base-container"]}>
                    <div className={styles.base}>
                        <div />
                    </div>
                </div>

                <div className={styles["small-outer-pipe"]}>
                    <div className={styles["small-inner-pipe"]} />
                </div>

                <div className={styles["outer-pipe"]}>
                    <div className={styles["inner-pipe"]} />
                </div>

                <div className={styles["pipe-accents"]}>
                    <div className={styles["top-tube"]} />
                    <div className={styles["tube-holders"]}>
                        <div /><div /><div /><div /><div /><div />
                    </div>
                    <div className={styles.top} />
                    <div className={styles.topinset} />
                    <div className={styles.left}>
                        <div /><div /><div />
                    </div>
                    <div className={styles.right}>
                        <div /><div /><div />
                    </div>
                    <div className={styles["bottom-left"]} />
                    <div className={styles["bottom-right"]} />
                </div>

                <div className={styles.display}>
                    <div className={styles.row}>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[0]}</div>
                            <div>{displayChars[0]}</div>
                        </div>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[1]}</div>
                            <div>{displayChars[1]}</div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[2]}</div>
                            <div>{displayChars[2]}</div>
                        </div>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[3]}</div>
                            <div>{displayChars[3]}</div>
                        </div>
                    </div>
                    <div style={{ height: "0.2em" }} />
                    <div className={styles["small-row"]}>
                        <div className={styles.row}>
                            <div className={styles.col}>
                                <div>8</div>
                                <div>{displayChars[4]}</div>
                                <div>{displayChars[4]}</div>
                            </div>
                            <div className={styles.col}>
                                <div>8</div>
                                <div>{displayChars[5]}</div>
                                <div>{displayChars[5]}</div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[6]}</div>
                            <div>{displayChars[6]}</div>
                        </div>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[7]}</div>
                            <div>{displayChars[7]}</div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[8]}</div>
                            <div>{displayChars[8]}</div>
                        </div>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[9]}</div>
                            <div>{displayChars[9]}</div>
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[10]}</div>
                            <div>{displayChars[10]}</div>
                        </div>
                        <div className={styles.col}>
                            <div>8</div>
                            <div>{displayChars[11]}</div>
                            <div>{displayChars[11]}</div>
                        </div>
                    </div>
                </div>

                <div className={styles["glass-tube"]} />
                <div className={styles.hex}>
                    <div className={styles.overlay} />
                </div>

                <div className={styles["tube-base-container"]}>
                    <div className={styles.wires}>
                        <div /><div />
                    </div>
                    <div className={styles["tube-base"]} />
                    <div className={styles.rods}>
                        <div className={styles["left-rod"]} />
                        <div className={styles["center-rod"]} />
                        <div className={styles["right-rod"]} />
                    </div>
                    <div className={styles["tube-btm"]} />
                </div>

                <div className={styles["power-cord"]}>
                    <div /><div />
                </div>

                <div className={styles.button} onClick={toggle}>
                    <div />
                </div>
            </div>
        </div>
    );
};

export default NixieClock;