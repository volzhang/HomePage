import {Button} from "@/components/ui/button";
import {useThemeStore} from "@/vol_apps/theme/theme_store";
import {useEffect} from "react";
import {Moon, Sun} from "lucide-react";

export const Theme = () => {
	const {theme, setTheme} = useThemeStore();
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
			<Button
				className={"animate-fade-in-scale-1000"}
				variant={"outline"}
				size={"icon"}
				onClick={toggleTheme}>
				{theme === "light" ? <Sun/> : <Moon/>}
			</Button>
		</>
	);

};