import type { Meta, StoryObj } from "@storybook/react-vite";

import { Box } from "@/components/Box/Box";
import React from "react";

const EmptyComponent = ({ children }: { children: React.ReactNode }) =>
	children;

const meta = {
	title: "Gradients",
	component: EmptyComponent,
	tags: ["!autodocs", "!dev"],
} satisfies Meta<typeof EmptyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Pixel art often uses dithering to create gradients and shading.
 * This is a technique that uses patterns of pixels to create the illusion of color depth.
 * While originally this technique was used to optimize a limited color palette,
 * it has become a stylistic choice in pixel art.
 *
 * Pixelated, dithered gradients can be created easily via the Box component. Unlike CSS gradients, these gradients do not create a smooth transition between colors.
 * Instead, they use a pattern of pixels to create the illusion of a gradient. The more color stops you add, the smoother the gradient will appear.
 *
 * Gradients are defined as strings, similar to CSS gradients. For example:
 *
 * ```javascript
 * 90deg, #ff0000 20%, pink, primary 80%
 * ```
 */
export const Default: Story = {
	args: {
		children: (
			<Box
				sx={{
					backgroundGradient: "90deg, #ff0000, pink, primary",
					width: "200px",
					height: "200px",
				}}
			/>
		),
	},
};

/**
 * Only the 4 cardinal directions are supported: 0deg, 90deg, 180deg, and 270deg.
 */
export const Directional: Story = {
	args: {
		children: (
			<div style={{ display: "flex", gap: "10px", flexDirection: "row" }}>
				<Box
					sx={{
						backgroundGradient: "90deg, #ff0000, pink, primary",
						width: "100px",
						height: "100px",
					}}
				/>
				<Box
					sx={{
						backgroundGradient: "180deg, #ff0000, pink, primary",
						width: "100px",
						height: "100px",
					}}
				/>
				<Box
					sx={{
						backgroundGradient: "270deg, #ff0000, pink, primary",
						width: "100px",
						height: "100px",
					}}
				/>
				<Box
					sx={{
						backgroundGradient: "0deg, #ff0000, pink, primary",
						width: "100px",
						height: "100px",
					}}
				/>
			</div>
		),
	},
};

/**
 * The dithering pattern changes depending on the available size.
 *
 * Drag the below slider to see the content change width, and the dithering pattern between each color stop change.
 */
export const Size: Story = {
	args: {
		children: null,
	},
	render: () => {
		const [size, setSize] = React.useState(100);
		return (
			<div>
				<input
					type="range"
					value={size}
					min={10}
					max={500}
					step={10}
					onChange={(e) => setSize(Number(e.target.value))}
				/>
				<Box
					sx={{
						backgroundGradient: "0deg, #888, #ddd",
						height: "200px",
						width: `${size}px`,
					}}
				/>
			</div>
		);
	},
};
