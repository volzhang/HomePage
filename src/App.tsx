import {BgApp}                from "@/vol_apps/bg/bg";
import {ContextMenuComponent} from "@/vol_apps/cMenu/cMenu";
import {I18nUi}               from "@/vol_apps/i8n/i18n_ui";
import {LinkGithub}           from "@/vol_apps/link_github/link_github";
import {SearchComponent}      from "@/vol_apps/search/search";
import {Navigation}           from "@/vol_apps/navigate/navigate";
import {Theme}                from "@/vol_apps/theme/theme";
import {SortableTiles}        from "@/vol_apps/tile/tile";
import {TagComponent}         from "@/vol_apps/tag/tag";
import {TileUi}               from "@/vol_apps/tile/tile_ui";
// import {TiptapEditor} from "@/vol_apps/tiptap/TiptapEditor";
import {Version}              from "@/vol_apps/version/version";

export const App = () => {
	return (
		<>
			<div className={"flex gap-2 p-2"}>
				<Navigation/>
				<I18nUi/>
				<LinkGithub/>
				<Theme/>
			</div>
			<div className={"absolute top-2 right-2"}>
				<Version/>
			</div>
			<SearchComponent/>
			<TagComponent/>
			<ContextMenuComponent children={
				<SortableTiles/>
			}/>
			<TileUi/>
			{/*<TiptapEditor />*/}
			<BgApp/>
			{/*	推荐BG放到最下面（这样不用设置z-index）*/}
		</>);
};
