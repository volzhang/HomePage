import {Button} from "@/components/ui/button";
import {VERSION} from "@/vol_apps/tool/action/fetch";
import {openLinkInNewTab} from "@/vol_apps/tool/action/openLink";
import {useTranslation} from "react-i18next";

export const Version = () => {
	const {t} = useTranslation("version");
	return (
		<Button variant={"outline"}
				onClick={() => openLinkInNewTab("https://github.com/volzhang/HomePage")}
				className={"animate-fade-in-scale w-fit select-none"}>
			{t("Version")}：{VERSION}
		</Button>
	);
};