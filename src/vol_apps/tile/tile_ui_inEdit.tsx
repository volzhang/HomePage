import {HalfDrawer} from "@/vol_apps/tile/HalfDrawer";
import {Tile_ui_inEdit_head} from "@/vol_apps/tile/tile_ui_inEdit_head";
import {Tile_ui_inEdit_body} from "@/vol_apps/tile/tile_ui_inEdit_body";
import {useTileLogic} from "@/vol_apps/tile/useTileLogic";
import {Tile_ui_inEdit_styles} from "@/vol_apps/tile/tile_ui_inEdit_styles";
import {COMPONENTS, Tile_component} from "./Tile_component";
import {MyModal} from "@/vol_apps/tile/MyModal";
import {Tile_ui_inEdit_foot} from "@/vol_apps/tile/Tile_ui_inEdit_foot";

export const Ui_inEdit_menu = () => {

    const Logic = useTileLogic();
    return (
        <>
            <MyModal open={Logic.tileUiVisible}
                     onOpenChange={Logic.setTileUiVisible}
                     initialFocusRef={Logic.link_ref}
                     okRef={Logic.ok_ref}
            >
                <div className="flex flex-col">
                    {(Logic.link.startsWith("component:") && COMPONENTS[Logic.link] !== undefined)
                        ? <></>
                        : <Tile_ui_inEdit_head {...Logic}/>
                    }
                    <div className="mx-6 mt-6">
                        <HalfDrawer
                            isOpen={Logic.stylesIsOpen}
                            preview={
                                <Tile_ui_inEdit_body {...Logic}>
                                    <Tile_component {...Logic} />
                                </Tile_ui_inEdit_body>
                            }
                            panel={<Tile_ui_inEdit_styles {...Logic}/>}
                        >
                        </HalfDrawer>
                    </div>
                    <Tile_ui_inEdit_foot {...Logic}/>
                </div>
            </MyModal>
        </>
    );
};