import {Button} from "@/components/ui/button";
import {Github} from "lucide-react";

const LINK = "https://github.com/volzhang/HomePage";
export const LinkGithub = () => {
	return (
		<Button
			className={"animate-fade-in-scale-1000"}
			variant={"outline"}
			onClick={() => {
				window.open(LINK, "_blank", "noopener noreferrer");
			}}>
			<Github/>
		</Button>
	);
};