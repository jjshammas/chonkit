import type { Preview } from "@storybook/react-vite";
import { STATE_KEYS } from "../src/components/Box/createVisualStyle";
import { ChonkitProvider } from "../src/core/ChonkitProvider/ChonkitProvider";
import {
	LightingDirection,
	LightingProvider,
} from "../src/core/LightingProvider/LightingProvider";
import "../src/index.css";

const CK_GLOBAL_TYPES = {
	gridVisible: {
		name: "Grid",
		description: "Toggle the design grid overlay.",
		toolbar: {
			title: "Grid",
			dynamicTitle: true,
			icon: "grid",
			items: [
				{ value: "on", title: "On" },
				{ value: "off", title: "Off" },
			],
		},
	},
	gridSize: {
		name: "Grid Size",
		description: "Set the global block size used by ChonkitProvider.",
		toolbar: {
			title: "Grid Size",
			dynamicTitle: true,
			icon: "ruler",
			items: ["1", "1.5", "2", "3", "5", "10"],
		},
	},
	lightingDirection: {
		name: "Lighting",
		description: "Set the global lighting direction.",
		toolbar: {
			title: "Lighting",
			dynamicTitle: true,
			icon: "sun",
			items: ["0", "45", "90", "135", "180", "225", "270", "315"],
		},
	},
} satisfies NonNullable<Preview["globalTypes"]>;

const CK_DEFAULT_GLOBALS = {
	gridVisible: "off",
	gridSize: "2",
	lightingDirection: "90",
} as const;

const preview: Preview = {
	tags: ["autodocs"],
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		docs: {
			codePanel: true,
		},

		options: {
			storySort: {
				order: ["Introduction", "Styling", "*"],
			},
		},
	},
	argTypes: {
		...STATE_KEYS.reduce((acc, key) => {
			acc[key] = {
				control: {
					type: "object",
				},
				description: `A set of props to override when the component is in the "${key.substring(
					1,
				)}" state.`,
				if: {
					arg: key,
					exists: true,
				},
			};
			return acc;
		}, {}),
	},
	globalTypes: CK_GLOBAL_TYPES,
	initialGlobals: CK_DEFAULT_GLOBALS,
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
						padding: "calc(2 * var(--ck-block-size))",
					}}
				>
					<LightingProvider
						direction={
							context.globals.lightingDirection
								? (Number(
										context.globals.lightingDirection,
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
