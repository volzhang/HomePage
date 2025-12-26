import {BgApp}      from "@/vol_apps/bg/bg";
import {Desktop}    from "@/vol_apps/desktop/desktop";
import {SearchBar}  from "@/vol_apps/search/searchBar";
import {Navigation}                 from "@/vol_apps/navigate/navigate";
import {TileUi} from "@/vol_apps/tile/tile_ui";

export const App = () => {
	return (<>
		<Navigation/>
		<SearchBar/>
		<Desktop/>
		<TileUi/>
		<BgApp/>
		{/*	推荐BG放到最下面（这样不用设置z-index）*/}
	</>);
};
