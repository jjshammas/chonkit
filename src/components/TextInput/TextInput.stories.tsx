import type { Meta, StoryObj } from "@storybook/react-vite";

import { TextInput } from "./TextInput";

const meta = {
	component: TextInput,
	tags: ["autodocs"],
	parameters: {},
	args: {
		inputProps: {
			placeholder: "Type here",
		},
	},
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
	args: {
		size: "sm",
		inputProps: {
			placeholder: "Small input",
		},
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		inputProps: {
			placeholder: "Disabled input",
		},
	},
};
