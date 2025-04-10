import React from "react";
import type { Preview } from "@storybook/react";
import { ChonkitProvider } from "../src/components/ChonkitProvider/ChonkitProvider";
import "../src/index.css";

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	globalTypes: {
		gridVisible: {
			toolbar: {
				title: "Grid",
				items: ["on", "off"],
			},
		},
		gridSize: {
			toolbar: {
				title: "Grid Size",
				items: ["1", "1.5", "2", "3", "5", "10"],
			},
		},
	},
	initialGlobals: {
		gridVisible: "off",
	},
	decorators: [
		(Story, context) => {
			const disableWrapper = context.parameters?.disableWrapper;
			if (disableWrapper) {
				return <Story />;
			}
			return (
				<ChonkitProvider
					blockSize={
						context.globals.gridSize
							? Number(context.globals.gridSize)
							: 5
					}
					showGrid={context.globals.gridVisible === "on"}
					style={{
						padding: "calc(2 * var(--chonkit-block-size))",
					}}
				>
					<Story />
				</ChonkitProvider>
			);
		},
	],
};

export default preview;
