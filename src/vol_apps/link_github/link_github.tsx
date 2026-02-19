import {Button} from "@/components/ui/button";
import {Github} from "lucide-react";

const LINK = "https://github.com/volzhang/HomePage";
export const LinkGithub = () => {
	return (
		<Button
			variant={"outline"}
			onClick={() => {
				window.open(LINK, "_blank", "noopener noreferrer");
			}}>
			<Github className={"text-primary"}/>
		</Button>
	);
};