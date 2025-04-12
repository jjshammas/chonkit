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
		variant: "primary",
	},
};

export const Secondary: Story = {
	args: {
		variant: "secondary",
	},
};

export const Positive: Story = {
	args: {
		variant: "positive",
	},
};

export const Negative: Story = {
	args: {
		variant: "negative",
	},
};

export const Disabled: Story = {
	args: {
		variant: "disabled",
		disabled: true,
	},
};
