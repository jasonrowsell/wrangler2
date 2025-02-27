import React, { createContext, useEffect, useState } from "react";
import { Div } from "@cloudflare/elements";
import { useDraftWorker } from "./useDraftWorker";

import EditorPane from "./EditorPane";
import SplitPane from "./SplitPane";
import ToolsPane from "./ToolsPane";
import { TopBar } from "./TopBar";
import { BACKGROUND_GRAY } from "./constants";
import { observeDarkMode, theme } from "@cloudflare/style-const";
import { createComponent } from "@cloudflare/style-container";
import defaultHash from "./defaultHash";

type DraftWorkerWithPreviewUrl = ReturnType<typeof useDraftWorker> & {
	previewUrl: string;
	setPreviewUrl: React.Dispatch<React.SetStateAction<string>>;
};

export const ServiceContext = createContext<DraftWorkerWithPreviewUrl>(
	// QuickEditor is lazy loaded, & useDraftWorker() will be available in local component state
	{} as DraftWorkerWithPreviewUrl
);

function FullScreenLayout({ children }: { children: React.ReactNode }) {
	return (
		<Div
			display="flex"
			flexDirection="column"
			position="fixed"
			top={0}
			right={0}
			bottom={0}
			left={0}
		>
			{children}
		</Div>
	);
}
import { isDarkMode } from "@cloudflare/style-const";

const BrandDiv = createComponent(({ theme }) => ({
	height: theme.space[1],
	background: `linear-gradient(180deg, #F63 17.19%, #F6821F 66.67%)`,
}));

export default function QuickEditor() {
	const [_, setDarkMode] = useState(isDarkMode());
	useEffect(() => {
		observeDarkMode(() => setDarkMode(isDarkMode()));
	}, []);
	const workerHash = window.location.hash.slice(1);

	const [previewUrl, setPreviewUrl] = React.useState(`/`);

	const [initialWorkerContentHash, setInitialHash] = React.useState(workerHash);

	function updateWorkerHash(hash: string) {
		history.replaceState(null, "", hash);
	}

	const draftWorker = useDraftWorker(
		initialWorkerContentHash,
		updateWorkerHash
	);

	useEffect(() => {
		if (initialWorkerContentHash === "") {
			setInitialHash(defaultHash);
		}
	}, [initialWorkerContentHash]);

	return (
		<FullScreenLayout>
			<BrandDiv />

			<ServiceContext.Provider
				value={{
					...draftWorker,
					previewUrl,
					setPreviewUrl,
				}}
			>
				<TopBar />
				<Div position="relative" flex="1">
					<SplitPane
						split="vertical"
						defaultSize="60%"
						minSize={50}
						maxSize={-50}
						style={{ backgroundColor: BACKGROUND_GRAY }}
						paneStyle={{ backgroundColor: theme.colors.background }}
					>
						<EditorPane />
						<ToolsPane />
					</SplitPane>
				</Div>
			</ServiceContext.Provider>
		</FullScreenLayout>
	);
}
