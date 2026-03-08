import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { Box } from "../Box/Box";
import { ScrollArea } from "./ScrollArea";

/**
 * A scrollable area with a custom scrollbar to match the rest of the design system.
 *
 * The ScrollArea uses native browser scrolling behavior, so it supports all the usual features like momentum scrolling on iOS and scroll chaining.
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
					</p>,
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
							sx={{
								backgroundColor: "#ccc",
								padding: 5,
								width: "200px",
								height: "200px",
							}}
						>
							I am Box
						</Box>,
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

export const Callbacks: Story = {
	render: () => {
		const [scrollCount, setScrollCount] = useState(0);
		const [scrollStartCount, setScrollStartCount] = useState(0);
		const [scrollStopCount, setScrollStopCount] = useState(0);
		const [lastTop, setLastTop] = useState(0);
		const [lastLeft, setLastLeft] = useState(0);

		return (
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "stretch",
					justifyContent: "center",
					height: "300px",
					backgroundColor: "#ddd",
					gap: "20px",
					padding: "20px",
				}}
			>
				<ScrollArea
					onScroll={(values) => {
						setScrollCount((count) => count + 1);
						setLastTop(values.scrollTop);
						setLastLeft(values.scrollLeft);
					}}
					onScrollStart={() => {
						setScrollStartCount((count) => count + 1);
					}}
					onScrollStop={() => {
						setScrollStopCount((count) => count + 1);
					}}
				>
					<>
						{Array(20).fill(
							<p>
								Scroll to fire callbacks. Lorem ipsum Lorem
								ipsumLorem ipsumLorem ipsumLorem ipsumLorem
								ipsumLorem ipsumLorem ipsumLorem ipsumLorem
								ipsumLorem ipsumLorem ipsumLorem ipsumLorem
								ipsumLorem ipsumLorem ipsumLorem ipsum Lorem
								ipsumLorem ipsumLorem ipsumLorem ipsumLorem
								ipsumLorem ipsumLorem ipsumLorem ipsum
							</p>,
						)}
					</>
				</ScrollArea>
				<div
					style={{
						width: "220px",
						backgroundColor: "#bbb",
						padding: "12px",
						fontSize: "12px",
						lineHeight: 1.4,
					}}
				>
					<div>onScroll: {scrollCount}</div>
					<div>onScrollStart: {scrollStartCount}</div>
					<div>onScrollStop: {scrollStopCount}</div>
					<div>scrollTop: {Math.round(lastTop)}</div>
					<div>scrollLeft: {Math.round(lastLeft)}</div>
				</div>
			</div>
		);
	},
};
