import {BgApp}                from "@/vol_apps/bg/bg";
import {CmOpen}               from "@/vol_apps/cm/cm_open";
import {ContextMenuComponent} from "@/vol_apps/cMenu/cMenu";
import {DndFile}              from "@/vol_apps/dndFile/dndFile";
import {I18nUi}               from "@/vol_apps/i8n/i18n_ui";
import {LinkGithub}           from "@/vol_apps/link_github/link_github";
import {Menu}                 from "@/vol_apps/menu/menu";
import {SearchComponent}      from "@/vol_apps/search/search";
import {Theme}                from "@/vol_apps/theme/theme";
import {SortableTiles}        from "@/vol_apps/tile/tile";
import {TagComponent}         from "@/vol_apps/tag/tag";
import {TileUi}               from "@/vol_apps/tile/tile_ui";
import {ToasterUi}            from "@/vol_apps/toaster/toaster_ui";
import {Version}              from "@/vol_apps/version/version";
import {Cm}                   from "./vol_apps/cm/cm";

export const App = () => {
	return (
		<>
			<ToasterUi/>
			<div className={"flex gap-2 p-2"}>
				<Menu/>
				<I18nUi/>
				<LinkGithub/>
				<Theme/>
				<CmOpen/>
			</div>
			<Cm/>
			<div className={"absolute top-2 right-2"}>
				<Version/>
			</div>
			<SearchComponent/>
			<TagComponent/>
			<ContextMenuComponent children={
				<SortableTiles/>
			}/>
			<TileUi/>
			<DndFile/>
			<BgApp/>
			{/*	推荐BG放到最下面（这样不用设置z-index）*/}
		</>);
};
