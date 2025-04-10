import type { Meta, StoryObj } from "@storybook/react";

import ExampleComponent from "./ExampleComponent";

/**
 * This is just an example
 */
const meta = {
	component: ExampleComponent,
	tags: ["autodocs"],
	args: {
		title: "Title",
	},
} satisfies Meta<typeof ExampleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "Hello World",
	},
};
