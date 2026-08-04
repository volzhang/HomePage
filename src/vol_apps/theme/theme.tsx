import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";
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

export const Theme = () => {
    const {theme, setTheme, themeHydrated} = useSignal(themeStore("theme"));

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <>
            <>
                {themeHydrated && (
                    <Button className={"animate-fade-in-scale"}
                        variant="outline" size="icon" onClick={toggleTheme}>
                        {theme === "light" ? <Sun /> : <Moon />}
                    </Button>
                )}
            </>
        </>
    );

};