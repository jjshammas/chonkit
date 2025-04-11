import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";

/**
 * This is just an example
 */
const meta = {
	component: Button,
	tags: ["autodocs"],
	parameters: {
		layout: "centered",
	},
	args: {
		children: "Click me",
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		borderRadius: 6,
		borderSize: 1,
		borderColor: "rgba(0,0,0,0.3)",
		bevelHighlightSize: 1,
		bevelShadowSize: 1,
	},
};
