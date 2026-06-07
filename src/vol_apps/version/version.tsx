import {Button} from "@/components/ui/button";
import {VERSION} from "@/vol_apps/tool/action/fetch";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {useLanguage} from "@/vol_apps/language/useLanguage.ts";

export const Version = () => {
	const {t} = useLanguage()
	return (
		<Button variant={"outline"}
				onClick={() => openLinkInNewTab("https://github.com/volzhang/HomePage")}
				className={"animate-fade-in-scale w-fit select-none"}>
			{t("Version")}：{VERSION}
		</Button>
	);
};