import React from "react";
import type { Preview } from "@storybook/react";
import { ChonkitProvider } from "../src/core/ChonkitProvider/ChonkitProvider";
import {
	LightingDirection,
	LightingProvider,
} from "../src/core/LightingProvider/LightingProvider";
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
		lightingDirection: {
			toolbar: {
				title: "Lighting",
				items: ["0", "45", "90", "135", "180", "225", "270", "315"],
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
					<LightingProvider
						direction={
							context.globals.lightingDirection
								? (Number(
										context.globals.lightingDirection
								  ) as LightingDirection)
								: 90
						}
					>
						<Story />
					</LightingProvider>
				</ChonkitProvider>
			);
		},
	],
};

export default preview;
