import type { Meta, StoryObj } from "@storybook/react";

import { AnimatedBox } from "./AnimatedBox";
import { useState } from "react";

/**
 * This is just an example
 */
const meta = {
	component: AnimatedBox,
	args: {
		baseProps: {
			backgroundColor: "#ddd",
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
} satisfies Meta<typeof AnimatedBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		animation: {
			enter: {
				frames: [
					{ percent: 0, styles: "opacity: 0;" },
					{ percent: 100, styles: "opacity: 1;" },
				],
				duration: 1000,
				easing: "ease-out",
				onBeforeStart: () => console.log("Enter starting..."),
				onAfterEnd: () => console.log("Enter complete."),
			},
			exit: {
				frames: [
					{ percent: 0, styles: "opacity: 1;" },
					{ percent: 100, styles: "opacity: 0;" },
				],
				duration: 1000,
				easing: "ease-in",
				onBeforeStart: () => console.log("Exit starting..."),
				onAfterEnd: () => console.log("Exit complete, now unmount."),
			},
		},
	},
	render: (args) => {
		const [isVisible, setIsVisible] = useState(true);
		return (
			<div>
				<button onClick={() => setIsVisible((prev) => !prev)}>
					Toggle
				</button>
				<AnimatedBox {...args} isVisible={isVisible} />
			</div>
		);
	},
};

export const FromTo: Story = {
	args: {
		animation: {
			enter: {
				from: {
					yBlocks: -3,
					opacity: 0,
				},
				to: {
					yBlocks: 0,
					opacity: 1,
				},
				duration: 300,
			},
			exit: {
				from: {
					xBlocks: 0,
					opacity: 1,
				},
				to: {
					xBlocks: -10,
					opacity: 0,
				},
				duration: 1000,
			},
		},
	},
	render: (args) => {
		const [isVisible, setIsVisible] = useState(true);
		return (
			<div>
				<button onClick={() => setIsVisible((prev) => !prev)}>
					Toggle
				</button>
				<AnimatedBox {...args} isVisible={isVisible} />
			</div>
		);
	},
};
