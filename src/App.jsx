import {BgApp}         from "@/vol_apps/bg/bg";
import {SearchBar}     from "@/vol_apps/search/searchBar";
import {Navigation}    from "@/vol_apps/navigate/navigate";
import {SortableTiles} from "@/vol_apps/tile/tile";
import {TileUi}        from "@/vol_apps/tile/tile_ui";
import {Tags}          from "@/vol_apps/tag/tag";

export const App = () => {
	return (<>
		<Navigation/>
		<SearchBar/>
		<Tags/>
		<SortableTiles/>
		<TileUi/>
		<BgApp/>
		{/*	推荐BG放到最下面（这样不用设置z-index）*/}
	</>);
};
