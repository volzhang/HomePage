export const openLinkInNewTab = (url:string) => {
	const link = document.createElement('a');
	link.href = url;
	link.target = '_blank';
	link.rel = 'noopener noreferrer';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

// export function openLinkInNewTabForWindows(url:string) {
// 	window.open(url, "_blank", "noopener noreferrer");
// }