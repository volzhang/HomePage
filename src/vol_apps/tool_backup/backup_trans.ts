import localforage from "localforage";

const tiles_v2 = [
	{
		"id": 1,
		"href": "https://github.com/",
		"name": "Github",
		"alt": "Github",
		"img": {
			"data": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNiAwQzcuMTYgMCAwIDcuMTYgMCAxNkMwIDIzLjA4IDQuNTggMjkuMDYgMTAuOTQgMzEuMThDMTEuNzQgMzEuMzIgMTIuMDQgMzAuODQgMTIuMDQgMzAuNDJDMTIuMDQgMzAuMDQgMTIuMDIgMjguNzggMTIuMDIgMjcuNDRDOCAyOC4xOCA2Ljk2IDI2LjQ2IDYuNjQgMjUuNTZDNi40NiAyNS4xIDUuNjggMjMuNjggNSAyMy4zQzQuNDQgMjMgMy42NCAyMi4yNiA0Ljk4IDIyLjI0QzYuMjQgMjIuMjIgNy4xNCAyMy40IDcuNDQgMjMuODhDOC44OCAyNi4zIDExLjE4IDI1LjYyIDEyLjEgMjUuMkMxMi4yNCAyNC4xNiAxMi42NiAyMy40NiAxMy4xMiAyMy4wNkM5LjU2IDIyLjY2IDUuODQgMjEuMjggNS44NCAxNS4xNkM1Ljg0IDEzLjQyIDYuNDYgMTEuOTggNy40OCAxMC44NkM3LjMyIDEwLjQ2IDYuNzYgOC44MiA3LjY0IDYuNjJDNy42NCA2LjYyIDguOTggNi4yIDEyLjA0IDguMjZDMTMuMzIgNy45IDE0LjY4IDcuNzIgMTYuMDQgNy43MkMxNy40IDcuNzIgMTguNzYgNy45IDIwLjA0IDguMjZDMjMuMSA2LjE4IDI0LjQ0IDYuNjIgMjQuNDQgNi42MkMyNS4zMiA4LjgyIDI0Ljc2IDEwLjQ2IDI0LjYgMTAuODZDMjUuNjIgMTEuOTggMjYuMjQgMTMuNCAyNi4yNCAxNS4xNkMyNi4yNCAyMS4zIDIyLjUgMjIuNjYgMTguOTQgMjMuMDZDMTkuNTIgMjMuNTYgMjAuMDIgMjQuNTIgMjAuMDIgMjYuMDJDMjAuMDIgMjguMTYgMjAgMjkuODggMjAgMzAuNDJDMjAgMzAuODQgMjAuMyAzMS4zNCAyMS4xIDMxLjE4QzI3LjQyIDI5LjA2IDMyIDIzLjA2IDMyIDE2QzMyIDcuMTYgMjQuODQgMCAxNiAwVjBaIiBmaWxsPSIjMjQyOTJFIi8+Cjwvc3ZnPgo=",
			"mimeType": "image/svg+xml"
		},

	},
	{
		"id": 2,
		"href": "https://grok.com/",
		"name": "Grok",
		"alt": "Grok",
		"img": {
			"data": "data:image/svg+xml;base64,PHN2ZyBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaGVpZ2h0PSIxZW0iIHN0eWxlPSJmbGV4Om5vbmU7bGluZS1oZWlnaHQ6MSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMWVtIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5Hcm9rPC90aXRsZT48cGF0aCBkPSJNOS4yNyAxNS4yOWw3Ljk3OC01Ljg5N2MuMzkxLS4yOS45NS0uMTc3IDEuMTM3LjI3Mi45OCAyLjM2OS41NDIgNS4yMTUtMS40MSA3LjE2OS0xLjk1MSAxLjk1NC00LjY2NyAyLjM4Mi03LjE0OSAxLjQwNmwtMi43MTEgMS4yNTdjMy44ODkgMi42NjEgOC42MTEgMi4wMDMgMTEuNTYyLS45NTMgMi4zNDEtMi4zNDQgMy4wNjYtNS41MzkgMi4zODgtOC40MmwuMDA2LjAwN2MtLjk4My00LjIzMi4yNDItNS45MjQgMi43NS05LjM4My4wNi0uMDgyLjEyLS4xNjQuMTc5LS4yNDhsLTMuMzAxIDMuMzA1di0uMDFMOS4yNjcgMTUuMjkyTTcuNjIzIDE2LjcyM2MtMi43OTItMi42Ny0yLjMxLTYuODAxLjA3MS05LjE4NCAxLjc2MS0xLjc2MyA0LjY0Ny0yLjQ4MyA3LjE2Ni0xLjQyNWwyLjcwNS0xLjI1YTcuODA4IDcuODA4IDAgMDAtMS44MjktMUE4Ljk3NSA4Ljk3NSAwIDAwNS45ODQgNS44M2MtMi41MzMgMi41MzYtMy4zMyA2LjQzNi0xLjk2MiA5Ljc2NCAxLjAyMiAyLjQ4Ny0uNjUzIDQuMjQ2LTIuMzQgNi4wMjItLjU5OS42My0xLjE5OSAxLjI1OS0xLjY4MiAxLjkyNWw3LjYyLTYuODE1Ij48L3BhdGg+PC9zdmc+",
			"mimeType": "image/svg+xml"
		}
	}
	]

export const backup_trans = async (): Promise<void> => {

	const tiles = tiles_v2.map((tile) => (
			{
				id: tile.id,
				url: tile.href,
				meta: {
					name: tile.name,
					alt: tile.alt,
					icon: tile.img.data,
					tags: [],
				}
			}
		)
	);

	const persisted = {
		state: {
			tiles: tiles,
			tileUiVisible: false,
			tileInEditId: 0,
		},
		version: 0,
	};

	const jsonString = JSON.stringify(persisted);
	await localforage.setItem("tile", jsonString);
	// await downloadAsJsonFile({tiles:tiles});
};