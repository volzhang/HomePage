import {Button} from "@/components/ui/button";
import {useThemeAtom} from "@/vol_apps/theme/themeAtom.ts"
import {useEffect} from "react";
import {Moon, Sun} from "lucide-react";

export const Theme = () => {
	const {theme, setTheme, hydrated} = useThemeAtom();

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [theme]);

	const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

	return (
		<>
			{
				hydrated &&
				<Button
					className={"animate-fade-in-scale"}
					variant={"outline"}
					size={"icon"}
					onClick={toggleTheme}>
					{theme === "light" ? <Sun/> : <Moon/>}
				</Button>
			}
		</>
	);

};