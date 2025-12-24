import {BgApp}      from "@/vol_apps/bg/bg";
import {Desktop}    from "@/vol_apps/desktop/desktop";
import {SearchBar}  from "@/vol_apps/search/searchBar";
import {Navigation} from "@/vol_apps/navigate/navigate";

export const App = () => {
	return (<>
		<Navigation/>
		<SearchBar/>
		<Desktop/>
		<BgApp/>
		{/*	推荐BG放到最下面（这样不用设置z-index）*/}
	</>);
};
