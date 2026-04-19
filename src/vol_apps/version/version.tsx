import {Button} from "@/components/ui/button";
import {VERSION} from "@/vol_apps/tool/action/fetch";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {useLanguageStore} from "@/vol_apps/language/language_store";

export const Version = () => {
	const {t} = useLanguageStore()
	return (
		<Button variant={"outline"}
				onClick={() => openLinkInNewTab("https://github.com/volzhang/HomePage")}
				className={"animate-fade-in-scale w-fit select-none"}>
			{t("Version")}：{VERSION}
		</Button>
	);
};