import type { Meta, StoryObj } from "@storybook/react";

import { ScrollArea } from "./ScrollArea";
import { Box } from "../Box/Box";

/**
 * A scrollable area with a custom scrollbar to match the rest of the design system.
 *
 * To customize the scrollbar design, use the `ScrollAreaTrack` and `ScrollAreaThumb` theme properties. These elements are rendered as Box components, meaning you can use familiar properties like borderRadius, backgroundColor, and depth.
 *
 * Note that the thumb is rendered as a child of the track, and the track hides all overflow. This means that some visual effects may not be possible, such as thumbs that are larger than the track or thumbs with drop shadows. This design decision was chosen because on platforms with "overscroll" (Mac, iOS), the thumb would be rendered outside of the track if overflow was visible.
 */
const meta = {
	component: ScrollArea,
	args: {},
	parameters: {
		controls: {
			exclude: "children",
		},
	},
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: (
			<>
				{Array(20).fill(
					<p>
						Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem
						ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem
						ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem
						ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem
						ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem
						ipsumLorem ipsumLorem ipsum
					</p>
				)}
			</>
		),
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

export const HorizontalScroll: Story = {
	args: {
		children: (
			<div>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						gap: "20px",
						padding: "20px",
						width: "5000px",
					}}
				>
					{Array(20).fill(
						<Box
							backgroundColor="#ccc"
							padding={5}
							width={"200px"}
							height="200px"
						>
							I am Box
						</Box>
					)}
				</div>
			</div>
		),
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
