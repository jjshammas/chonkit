import type { Meta, StoryObj } from "@storybook/react";

import { Panel } from "./Panel";
import { Button } from "../Button/Button";

/**
 * This is just an example
 */
const meta = {
	component: Panel,
	tags: ["autodocs"],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "I am a Panel",
	},
};

export const WithControlBar: Story = {
	args: {
		children: "I am a Panel",
		controlBarCenter: "Hey, look at this!",
		controlBarRight: <Button>Click me</Button>,
	},
};

export const WithActionBar: Story = {
	args: {
		children: "I am a Panel",
		actionBarLeft: <Button variant="secondary">Cancel</Button>,
		actionBarRight: <Button>Proceed</Button>,
	},
};
