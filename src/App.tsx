// import {Aiapi}                from "@/vol_apps/api_ai/aiapi";
// import {JsxBase64}            from "@/vol_apps/api_pic/getFaviconBase64";
// import {WeatherTest} from "@/vol_apps/api_weather/WeatherTest";
import {BgApp}                from "@/vol_apps/bg_zustand/bg";
import {ContextMenuComponent} from "@/vol_apps/cMenu/cMenu";
import {I18nUi}               from "@/vol_apps/i8n/i18n_ui";
// import {Iframe}               from "@/vol_apps/iframe/iframe";
import {LinkGithub}           from "@/vol_apps/link_github/link_github";
import {SearchComponent}      from "@/vol_apps/search_zustand/search";
import {Navigation}           from "@/vol_apps/navigate/navigate";
import {SortableTiles}        from "@/vol_apps/tile/tile";
import {TagComponent}         from "@/vol_apps/tag_zustand/tag";
import {TileUi}               from "@/vol_apps/tile/tile_ui";
import {Version}              from "@/vol_apps/version/version";

export const App = () => {
	return (
		<>
			<div className={"flex"}>
				<Navigation/>
				<I18nUi/>
				{/*<LinkPrivacy/>*/}
				<LinkGithub/>
			</div>
			<Version/>
			<SearchComponent/>
			<TagComponent/>
			<ContextMenuComponent children={
				<SortableTiles/>
			}/>
			<TileUi/>
			{/*<JsxBase64/>*/}
			{/*<WeatherTest/>*/}
			{/*<Aiapi/>*/}
			{/*<Iframe/>*/}
			<BgApp/>
			{/*	推荐BG放到最下面（这样不用设置z-index）*/}
		</>);
};
