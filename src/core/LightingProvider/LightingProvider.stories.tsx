import type { Meta, StoryObj } from "@storybook/react";

import { ChonkitProvider } from "../ChonkitProvider/ChonkitProvider";
import { LightingProvider } from "./LightingProvider";
import { Button } from "@/components/Button/Button";

/**
 * The wrapping component for the Chonkit library. It provides the context for the
 * library and allows you to set the block size for the grid system.
 * You must wrap your application with this component when using Chonkit components.
 */
const meta = {
	component: LightingProvider,
	tags: ["autodocs"],
	parameters: {
		disableWrapper: true,
	},
	decorators: [
		(Story, context) => (
			<ChonkitProvider
				blockSize={
					context.globals.gridSize
						? Number(context.globals.gridSize)
						: 5
				}
				showGrid={context.globals.gridVisible === "on"}
			>
				<Story />
			</ChonkitProvider>
		),
	],
} satisfies Meta<typeof LightingProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		direction: 0,
		children: (
			<>
				<div
					style={{
						display: "flex",
						gap: "10px",
						padding: "10px",
						alignItems: "center",
					}}
				>
					<span style={{ width: "90px" }}>Bevel:</span>
					<Button borderRadius={2} bevelHighlightSize={1}>
						Highlight 1
					</Button>
					<Button
						borderRadius={2}
						bevelHighlightSize={2}
						bevelShadowSize={2}
					>
						Highlight+Shadow 2
					</Button>
					<Button borderRadius={2} bevelShadowSize={3}>
						Shadow 3
					</Button>
				</div>
				<div
					style={{
						display: "flex",
						gap: "10px",
						background: "pink",
						padding: "10px",
						alignItems: "center",
					}}
				>
					<span style={{ width: "90px" }}>Emboss:</span>
					<Button borderRadius={2} embossHighlightSize={1}>
						Highlight 1
					</Button>
					<Button
						borderRadius={2}
						embossHighlightSize={2}
						embossShadowSize={2}
					>
						Highlight+Shadow 2
					</Button>
					<Button borderRadius={2} embossShadowSize={3}>
						Shadow 3
					</Button>
				</div>
			</>
		),
	},
};
