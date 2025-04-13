import type { Meta, StoryObj } from "@storybook/react";

import { ChonkitProvider } from "./ChonkitProvider";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";

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
					snap
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
				</Box>
				<Box
					snap
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
