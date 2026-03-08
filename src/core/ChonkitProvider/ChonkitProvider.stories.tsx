import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { ChonkitProvider } from "./ChonkitProvider";

/**
 * The wrapping component for the Chonkit library. It provides the context for the
 * library and allows you to set the block size for the grid system.
 * You must wrap your application with this component when using Chonkit components.
 */
const meta = {
	component: ChonkitProvider,
	tags: ["autodocs"],
	parameters: {
		disableWrapper: true,
	},
	argTypes: {
		blockSize: {
			description: "Pixel size for the grid system and block units.",
			control: { type: "number", min: 1 },
		},
		showGrid: {
			description: "Renders the grid overlay for debugging layout.",
			control: "boolean",
		},
		theme: {
			description:
				"Theme name or partial theme object; defaults to the built-in theme.",
			control: "object",
		},
		stepRateHz: {
			description:
				"Animation step rate in Hz for time-based effects.",
			control: { type: "number", min: 1 },
		},
		disableAnimationBlockSnapping: {
			description:
				"Disables snapping animation frames to the block grid.",
			control: "boolean",
		},
		treatClicksAsTouch: {
			description:
				"Treats all Box onClick handlers as onClickOrTouch.",
			control: "boolean",
		},
		children: {
			description: "Content rendered within the provider root.",
		},
		style: {
			description: "Inline styles applied to the provider root.",
			control: "object",
		},
		className: {
			description: "Class name applied to the provider root.",
			control: "text",
		},
	},
} satisfies Meta<typeof ChonkitProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		showGrid: true,
		blockSize: 10,
		children: (
			<>
				<Box
					style={{
						padding: "40px",
						margin: "20px",
						backgroundColor: "#eee",
					}}
				>
					Hello Mercury
					<br />
					Hello Venus
					<br />
					Hello Earth
					<br />
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
					do eiusmod tempor incididunt ut labore et dolore magna
					aliqua. Ut enim ad minim veniam, quis nostrud exercitation
					ullamco laboris nisi ut aliquip ex ea commodo consequat.
					Duis aute irure dolor in reprehenderit in voluptate velit
					esse cillum
				</Box>
				<Box
					style={{
						padding: "40px",
						margin: "20px",
						backgroundColor: "#eee",
					}}
				>
					Hello Mars
				</Box>
			</>
		),
		style: {
			border: "1px dashed black",
		},
	},
};

export const Themed: Story = {
	decorators: [
		(Story) => (
			<div
				style={{
					backgroundColor: "#eee",
					display: "flex",
					flexDirection: "row",
					gap: "20px",
				}}
			>
				<Story />
				<ChonkitProvider
					style={{
						padding: "20px",
					}}
					blockSize={2}
					theme="flat"
				>
					<Button variant="primary">Flat</Button>
				</ChonkitProvider>
			</div>
		),
	],
	args: {
		blockSize: 2,
		style: {
			padding: "20px",
		},
		children: <Button variant="primary">Default</Button>,
	},
};
