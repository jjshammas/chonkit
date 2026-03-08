import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/Button/Button";
import { ChonkitProvider } from "../ChonkitProvider/ChonkitProvider";
import { LightingProvider } from "./LightingProvider";

/**
 * A wrapping component that allows you to define the lighting direction for effects like emboss and bevels.<br />
 * If this component is not found, a default direction of 90 degrees is used.<br />
 * This component can be nested.
 */
const meta = {
	component: LightingProvider,
	tags: ["autodocs"],
	parameters: {
		disableWrapper: true,
		controls: {
			exclude: "children",
		},
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
	args: {
		direction: 45,
	},
} satisfies Meta<typeof LightingProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
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
					<Button
						sx={{
							borderRadius: 2,
							bevelHighlightSize: 1,
						}}
					>
						Highlight 1
					</Button>
					<Button
						sx={{
							borderRadius: 2,
							bevelHighlightSize: 2,
							bevelShadowSize: 2,
						}}
					>
						Highlight+Shadow 2
					</Button>
					<Button sx={{ borderRadius: 2, bevelShadowSize: 3 }}>
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
					<Button sx={{ borderRadius: 2, embossHighlightSize: 1 }}>
						Highlight 1
					</Button>
					<Button
						sx={{
							borderRadius: 2,
							embossHighlightSize: 2,
							embossShadowSize: 2,
						}}
					>
						Highlight+Shadow 2
					</Button>
					<Button sx={{ borderRadius: 2, embossShadowSize: 3 }}>
						Shadow 3
					</Button>
				</div>
			</>
		),
	},
};

export const Nested: Story = {
	args: {
		children: (
			<>
				<Button
					sx={{
						borderRadius: 2,
						bevelHighlightSize: 2,
						bevelShadowSize: 2,
					}}
				>
					Controlled by provider 1
				</Button>
				<LightingProvider direction={225}>
					<div
						style={{
							background: "pink",
							padding: "10px",
							marginTop: "20px",
						}}
					>
						<Button
							sx={{
								borderRadius: 2,
								bevelHighlightSize: 2,
								bevelShadowSize: 2,
							}}
						>
							Controlled by provider 2 (static 225 degrees)
						</Button>
					</div>
				</LightingProvider>
			</>
		),
	},
};
