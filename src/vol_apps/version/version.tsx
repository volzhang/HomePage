import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";

export const fetchVersion = async ():Promise<string> => {
	const res = await fetch("/manifest.json");
	const data = await res.json();
	return data.version || "unknown";
};

export const Version = () => {
	const {t} = useTranslation("version");
	const [version, setVersion] = useState<string>("");

	useEffect(() => {
		const loadVersion = async () => {
			const ver = await fetchVersion();
			setVersion(ver);
		};
		loadVersion().then(() => {});
	}, []);

	const LINK = "https://github.com/volzhang/HomePage";

	return (
		<Button
			variant={"outline"}
			onClick={() => {
				window.open(LINK, "_blank", "noopener noreferrer");
			}}
			className={cn(
				"animate-fade-in-scale w-30",
				"select-none",
			)}>
			{t("Version")}：{version}
		</Button>
	);
};