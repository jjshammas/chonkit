import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./_ExampleComponent";

/**
 * This is just an example
 */
const meta = {
	component: Panel,
	tags: ["autodocs"],
	args: {
		backgroundColor: "#ddd",
		_hover: {
			backgroundColor: "red",
		},
		children: "I am a Panel",
	},
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
