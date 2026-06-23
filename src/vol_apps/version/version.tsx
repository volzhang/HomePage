import {Button} from "@/components/ui/button";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";
import {VERSION} from "@/main.tsx";

export const Version = () => {
	const {t} = useLanguage()
	return (
		<Button variant={"outline"}
				onClick={() => openLinkInNewTab("https://github.com/volzhang/HomePage")}
				className={"opacity-0 hover:opacity-100 w-fit select-none "}>
			{t("Version")}：{VERSION}
		</Button>
	);
};