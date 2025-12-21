import type { Meta, StoryObj } from "@storybook/react";

import { Box } from "./Box";

/**
 * This is just an example
 */
const meta = {
	component: Box,
	tags: ["autodocs"],
	args: {
		sx: {
			backgroundColor: "#ddd",
			_hover: {
				backgroundColor: "red",
			},
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
	args: {},
};

export const WithRoundedCorners: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			borderRadius: [12, 8, 0, 5],
		},
	},
};

export const WithBevel: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			borderRadius: 12,
			bevelHighlightSize: 2,
			bevelShadowSize: 4,
		},
	},
};

export const Embossed: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			borderRadius: 12,
			embossHighlightSize: 2,
			embossShadowSize: 4,
		},
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
		sx: {
			// backgroundGradient: "0deg, #666, #888 20, #aaa 75%",
			// backgroundGradient: "90deg, #666, #888 50%, #aaa 75%",
			backgroundGradient: "90deg, #666, #888 10%, #888 70%, #aaa 90%",
		},
	},
};

export const WithDropShadow: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			dropShadow: "3 4 rgba(0, 0, 0, 0.3)",
		},
	},
};

/**
 * Create interactable components by using the _hover, _active, _focus, and _disabled props.
 */
export const Interactable: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			_hover: {
				backgroundColor: "red",
			},
			_active: {
				backgroundColor: "blue",
			},
		},
		children: (
			<div
				style={{
					padding: "40px",
					// backgroundColor: "#ddd",
				}}
			>
				Hover and click me
			</div>
		),
	},
};

/**
 * The Box component renders a container and inner div in order to accomodate all of the supported visual effects. Without using two containers, certain effects like shadows would not be possible, since clip-paths are used in order to effect rounded corners, which would also clip the shadow.
 *
 * When styling a Box with raw CSS properties or classnames, respect the two-div render by splitting positioning styles (size, flex, etc.) and assigning them to the container div by using `containerProps`.
 *
 * If you use the `sx` prop for positioning, like `width` or `margin`, Box will know to apply these to the outer container, while other props will be applied to the inner div.
 */
export const InsideFlexContainer: Story = {
	args: {
		sx: {
			backgroundColor: "#fff",
			borderRadius: 10,
			flex: 1,
			height: "100%",
		},
		children: "Hello World",
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

/**
 * Box supports 2 borders, an outer and an inner border. This is to help achieve a common pixel art pattern where the shape is "highlighted" by the inner border.
 */
export const Bordered: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			borderWidth: 2,
			borderColor: "#aaa",
			borderRadius: 3,
			innerborderWidth: 1,
			innerBorderColor: "#fff",
		},
	},
};

/**
 * The `depth` prop creates the illusion of depth, as if looking at the Box from above. The `depthColor` prop indicates the color of the "front face" of the Box. Shadows are rendered under the "front face."
 *
 * It is not currently possible to change the visual perspective direction.
 */
export const WithDepth: Story = {
	args: {
		sx: {
			backgroundColor: "#E0E5F8",
			depth: 6,
			depthColor: "#B4BDE1",
			borderRadius: 12,
			dropShadow: "3 5 rgba(0, 0, 0, 0.1)",
		},
		color: "primary",
	},
};

export const WithPositioningAttributes: Story = {
	args: {
		sx: {
			backgroundColor: "#ddd",
			borderRadius: 12,
			width: "200px",
			height: "200px",
			margin: "20px",
			padding: "20px",
		},
		children: "This Box has positioning attributes",
	},
};

export const Ex: Story = {
	args: {
		sx: {
			background: "#4865d8",
			color: "#fff",
			padding: "6px",
			borderRadius: 3,
			embossHighlightSize: 1,
			embossShadowSize: 1,
			borderWidth: 1,
			borderColor: "#000",
		},
		children: "This Box has positioning attributes",
	},
};
