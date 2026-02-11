import {BgApp}                from "@/vol_apps/bg_zustand/bg";
import {ContextMenuComponent} from "@/vol_apps/cMenu/cMenu";
import {I18nUi}               from "@/vol_apps/i8n/i18n_ui";
import {SearchComponent}      from "@/vol_apps/search_zustand/search";
import {Navigation}           from "@/vol_apps/navigate/navigate";
import {SortableTiles}        from "@/vol_apps/tile_zustand/tile";
import {DelayedTags}          from "@/vol_apps/tag_zustand/tag";
import {Version}              from "@/vol_apps/version/version";

export const App = () => {
	return (
		<>
			<div className={"flex"}>
				<Navigation/>
				<I18nUi/>
			</div>
			<Version/>
			<SearchComponent/>
			<DelayedTags/>
			<ContextMenuComponent children={
				<SortableTiles/>
			}/>
			<BgApp/>
			{/*	推荐BG放到最下面（这样不用设置z-index）*/}
		</>);
};
