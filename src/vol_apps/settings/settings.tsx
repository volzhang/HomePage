import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {MyModal} from "@/vol_apps/tile/MyModal";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Bookmark, Search, SquareMousePointer, Wallpaper } from "lucide-react";
import {cn} from "@/lib/utils";

const TabsTrigger_CLASS = "text-lg gap-3 px-3 py-2 items-center"
const TabsIcon_CLASS = "scale-120"

export const Settings = () => {
    const [open, setOpen] = useState(false)
    const [selectedTab, setSelectedTab] = useState("tags")

    return (
        <>
            <Button variant={"outline"} onClick={() => setOpen(!open)}>
                设置模态
            </Button>
            <MyModal open={open} onOpenChange={setOpen}>
                <Tabs
                    value={selectedTab} onValueChange={setSelectedTab}
                    orientation={"vertical"}>
                    <TabsList className={"m-2 bg-transparent"}>
                        <TabsTrigger
                            className={cn(TabsTrigger_CLASS,"bg-red-400",
                                {"bg-sBlue": selectedTab === "searchbar"},
                                )} value="searchbar">
                            <Search className={TabsIcon_CLASS}/>
                            搜索栏
                        </TabsTrigger>
                        <TabsTrigger className={TabsTrigger_CLASS} value="tags"><Bookmark className={TabsIcon_CLASS}/>标签栏</TabsTrigger>
                        <TabsTrigger className={TabsTrigger_CLASS} value="tiles"><SquareMousePointer className={TabsIcon_CLASS}/>磁砖墙</TabsTrigger>
                        <TabsTrigger className={TabsTrigger_CLASS} value="background"><Wallpaper className={TabsIcon_CLASS}/>背景</TabsTrigger>
                    </TabsList>
                    <TabsContent value="searchbar">Make changes to your account here.</TabsContent>
                    <TabsContent value="tags">Change your password here.</TabsContent>
                    <TabsContent value="tiles">Change your notifications here.</TabsContent>
                    <TabsContent value="background">Change your background here.</TabsContent>
                </Tabs>
            </MyModal>
        </>
    )
}
