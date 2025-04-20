import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "./Box";

/**
 * This is just an example
 */
const meta = {
	component: Box,
	tags: ["autodocs"],
	args: {
		backgroundColor: "#ddd",
		_hover: {
			backgroundColor: "red",
		},
		children: (
			<div
				style={{
					padding: "40px",
					// backgroundColor: "#ddd",
				}}
			>
				Hello World
			</div>
		),
		backgroundGradient: "270deg, #666, #888 10%, #888 70%, #aaa 90%",
	},
	parameters: {
		controls: {
			exclude: "children",
		},
	},
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		borderRadius: 12,
	},
};

export const WithRoundedCorners: Story = {
	args: {
		borderRadius: [12, 8, 0, 5],
	},
};

export const WithBevel: Story = {
	args: {
		borderRadius: 12,
		bevelHighlightSize: 2,
		bevelShadowSize: 4,
	},
};

export const Embossed: Story = {
	args: {
		borderRadius: 12,
		embossHighlightSize: 2,
		embossShadowSize: 4,
	},
	decorators: [
		(Story) => (
			<div
				style={{
					backgroundColor: "pink",
					padding: "20px",
				}}
			>
				<Story />
			</div>
		),
	],
};

export const WithGradientBackground: Story = {
	args: {
		// backgroundGradient: "0deg, #666, #888 20, #aaa 75%",
		// backgroundGradient: "90deg, #666, #888 50%, #aaa 75%",
		backgroundGradient: "90deg, #666, #888 10%, #888 70%, #aaa 90%",
	},
	decorators: [
		(Story) => (
			<div
				style={{
					backgroundColor: "pink",
					padding: "20px",
				}}
			>
				<Story />
			</div>
		),
	],
};

export const WithDropShadow: Story = {
	args: {
		dropShadow: "3 4 rgba(0, 0, 0, 0.3)",
	},
	decorators: [
		(Story) => (
			<div
				style={{
					padding: "20px",
				}}
			>
				<Story />
			</div>
		),
	],
};

export const InsideFlexContainer: Story = {
	args: {
		borderRadius: 10,
		containerProps: {
			style: {
				flex: 1,
				height: "100%",
			},
		},
		style: {
			backgroundColor: "#fff",
		},
		children: <span>"Hello World"</span>,
	},
	decorators: [
		(Story) => (
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					height: "300px",
					backgroundColor: "#ddd",
					gap: "20px",
					padding: "20px",
				}}
			>
				<Story />
				<div style={{ width: "100px", backgroundColor: "#bbb" }}>
					Adjacent fixed-width element
				</div>
			</div>
		),
	],
};
