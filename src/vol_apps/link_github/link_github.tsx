import {Github} from "lucide-react"
const LINK = "https://github.com/volzhang/HomePage"
export const LinkGithub = ()=>{
	return (
		<div className={"pt-1.5"}>
			<a href={LINK} target={"_blank"} className={"pl-1 flex items-center text-sm text-white"}>
				<Github className={"scale-70"}/>
			</a>
		</div>)
}