import type { Meta, StoryObj } from "@storybook/react-vite";

import { Text } from "./Text";

/**
 * Simply renders text. Rendering text inside a Text component is important for ensuring that text perfectly aligns with the grid system. Text renders a span with slight positioning adjustments.
 *
 * Generally, components will use the resolveTextProps() utility to convert props that are passed in as strings and wrap them with a Text component. This means you can pass simple strings in to components like Button without needing to wrap them in a Text component yourself.
 */
const meta = {
	component: Text,
	tags: ["autodocs"],
	args: {
		children: "I am Text",
	},
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};
