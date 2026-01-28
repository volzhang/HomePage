import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Label} from "@/components/ui/label";

export const Version = () => {
	const {t} = useTranslation("version");
	const [version, setVersion] = useState<string>("");

	useEffect(() => {
		fetch("/manifest.json")
			.then((res) => res.json())
			.then((data) => setVersion(data.version || "unknown"));
	}, []);

	return (
		<Label className={"absolute right-2.5 top-2.5 text-[#c8c8c8]"}>
			{t("Version")}：{version}
		</Label>
	);
};