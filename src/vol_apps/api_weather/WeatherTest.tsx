import {useEffect, useState} from "react";

export const WeatherTest = () => {
	const [jsonText, setJsonText] = useState<string>("");

	useEffect(() => {
		fetch("https://api.open-meteo.com/v1/forecast?latitude=47.32&longitude=130.27&current=temperature_2m,weather_code&timezone=Asia%2FShanghai")
			.then(res => res.text())           // 先拿纯文本
			.then(text => setJsonText(text))   // 直接存字符串
			.catch(err => setJsonText("请求失败：" + String(err)));
	}, []);

	return (
		<div className={"text-white"}>
			{jsonText || "加载中..."}
		</div>
	);
};