import {Moon, Sun} from "lucide-react"
import {getSignal, initStoreState, useSignal} from "@/vol_apps/04_persist_atoms";

type Theme = "dark" | "light";
export const themeStore = initStoreState({
    storeName: "theme",
    fields: { theme: "dark" as Theme},
});

const themeSignal = getSignal(themeStore("theme"));

const syncTheme = () => {
    const theme = themeSignal.get();
    const root = document.documentElement;
    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }
};

syncTheme();
themeSignal.subscribe(syncTheme);

export const ThemeToggle = () => {
    const {theme, setTheme, themeHydrated} = useSignal(themeStore("theme"));
    const isChecked = theme === "dark";

    const width = 56;
    const height = 36;

    const trackBorderWidth = 1;
    const thumbBorderWidth = 0;

    const thumbSize = 26;
    const iconSize = 22;

    const innerWidth = width - trackBorderWidth * 2;
    const innerHeight = height - trackBorderWidth * 2;

    const padding = (innerHeight - thumbSize) / 2;
    const distance = innerWidth - thumbSize - padding * 2;

    const transition = "transition-all duration-300 ease-in-out";

    const trackColor = isChecked
        ? "bg-background"
        : "bg-input/30!";

    const thumbColor = isChecked
        ? "bg-background"
        : "bg-input/30!";

    const trackBorder = "border border-border";
    const thumbBorder = "border border-border/20";

    const iconColor = ""

    return (
        themeHydrated &&
        <label
            className={`relative flex shrink-0 rounded-full ${trackColor} border ${trackBorder} ${transition} cursor-pointer overflow-hidden select-none`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                borderWidth: `${trackBorderWidth}px`,
                boxSizing: "border-box",
            }}
        >
            <input type="checkbox" className="sr-only" checked={isChecked} onChange={(e)=>{
                const checked = (e.currentTarget as HTMLInputElement).checked;
                setTheme(checked ? "dark" : "light");
            }}/>

            <span className={`absolute rounded-full ${thumbColor} border ${thumbBorder} flex items-center justify-center shadow-lg ${transition}`}
                  style={{
                      width: `${thumbSize}px`,
                      height: `${thumbSize}px`,
                      left: `${padding}px`,
                      top: `${padding}px`,
                      borderWidth: `${thumbBorderWidth}px`,
                      boxSizing: "border-box",
                      transform: `translateX(${isChecked ? distance : 0}px)`,
                  }}
            >
                <Sun size={iconSize} strokeWidth={1.5}
                     className={`absolute ${iconColor} ${transition} ${isChecked
                         ? "opacity-0 scale-90 rotate-90"
                         : "opacity-100 scale-100 rotate-0"
                     }`}
                />

                <Moon size={iconSize} strokeWidth={1.2}
                      className={`absolute ${iconColor} ${transition} ${isChecked
                          ? "opacity-100 scale-100 rotate-0"
                          : "opacity-0 scale-90 -rotate-100"
                      }`}
                />
            </span>
        </label>
    );
};