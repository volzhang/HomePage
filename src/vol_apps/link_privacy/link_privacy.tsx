import {useTranslation} from "react-i18next";

export const LinkPrivacy = ()=>{
	const {t} = useTranslation("privacy");
	return (
		<div className={"text-white text-sm pt-2"}>
			<a href="/privacy">
				{t("Privacy Policy")}
			</a>
		</div>)
}