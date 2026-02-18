export const Iframe = () => {
	const domain = "sina.com";
	const format = "png";
	const response = "image";
	const size = 96
	const api_url = `https://favicon.vemetric.com/${domain}?format=${format}&size=${size}&response=${response}`;


	return (
		<div className={""}>
			<iframe
				className={"border-none"}
				// style={""}
				src ={api_url}
				title="示例 iframe"
				width={size}
				height={size}
			/>
		</div>
	);
}