// import {Button} from "@/components/ui/button";
// import {Moon, Sun} from "lucide-react";
import {getSignal, initStoreState, useSignal} from "@/vol_apps/04_persist_atoms";
import {Switch} from "@/vol_apps/theme/theme2";

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

// export const Theme = () => {
//     const {theme, setTheme, themeHydrated} = useSignal(themeStore("theme"));
//
//     const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
//
//     return (
//         <>
//             <>
//                 {themeHydrated && (
//                     <Button className={"animate-fade-in-scale"}
//                         variant="outline" size="icon" onClick={toggleTheme}>
//                         {theme === "light" ? <Sun /> : <Moon />}
//                     </Button>
//                 )}
//             </>
//         </>
//     );
//
// };

export const Theme = () => {
    const {theme, setTheme, themeHydrated} = useSignal(themeStore("theme"));

    if (!themeHydrated) return null;

    return (
        <div className={"flex items-center justify-center h-[36px]"}>
            <Switch
                checked={theme === "dark"}
                onChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                }
            />
        </div>
    );
};