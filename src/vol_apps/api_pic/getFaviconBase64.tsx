import {useEffect, useState} from "react";

export const JsxBase64 = ({ domain = "google.com", size = 64}) => {
	const [base64, setBase64] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		async function fetchFavicon() {
			try {
				setLoading(true);
				const url = `https://favicon.vemetric.com/${domain}?size=${size}`;
				const res = await fetch(url);

				const blob = await res.blob();
				const reader = new FileReader();

				reader.onloadend = () => {
					if (mounted) {
						setBase64(reader.result as string);
						setLoading(false);
					}
				};
				reader.readAsDataURL(blob);
			} catch (err: any) {
				if (mounted) {
					console.error(err);
					setLoading(false);
				}
			}
		}

		fetchFavicon().then(() => {});

		return () => {
			mounted = false;
		};
	}, [domain]);

	if (loading) return <div>加载中...</div>;

	return base64 ? (
		<div>
			<img src={base64} alt={`${domain} favicon`} width={size} height={size} />
			<p className={"flex wrap-anywhere"}>
				{base64}
			</p>
		</div>
	) : null;
}