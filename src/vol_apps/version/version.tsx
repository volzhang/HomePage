import {Button} from "@/components/ui/button";
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

	return (
		<Button
			variant={"outline"}
			disabled={true}
			className={"border-none"}>
			{t("Version")}：{version}
		</Button>
	);
};