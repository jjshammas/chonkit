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
			sx: {
				backgroundColor: "#ddd",
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
					yBlocks: -4,
					opacity: 0,
				},
				to: {
					yBlocks: 0,
					opacity: 1,
				},
				duration: 300,
				easing: "ease-out",
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

export const Transition: Story = {
	args: {
		baseProps: {
			sx: {
				height: "40px",
				backgroundColor: "#4a9eff",
				borderRadius: "4px",
			},
		},
		children: null,
	},
	render: (args) => {
		const [progress, setProgress] = useState(0);

		const handleIncrease = () => {
			setProgress((prev) => Math.min(100, prev + 20));
		};

		const handleDecrease = () => {
			setProgress((prev) => Math.max(0, prev - 20));
		};

		const handleRandom = () => {
			setProgress(Math.floor(Math.random() * 101));
		};

		// Container is 300px wide, convert progress to pixels
		const containerWidth = 100;
		const targetWidth = (progress / 100) * containerWidth;

		return (
			<div>
				<div style={{ marginBottom: "20px" }}>
					<button
						onClick={handleIncrease}
						style={{ marginRight: "8px" }}
					>
						+20%
					</button>
					<button
						onClick={handleDecrease}
						style={{ marginRight: "8px" }}
					>
						-20%
					</button>
					<button
						onClick={handleRandom}
						style={{ marginRight: "8px" }}
					>
						Random
					</button>
					<span style={{ marginLeft: "12px" }}>
						Progress: {progress}%
					</span>
				</div>
				<div
					style={{
						width: `${containerWidth}px`,
						backgroundColor: "#ddd",
						borderRadius: "4px",
						overflow: "hidden",
					}}
				>
					<AnimatedBox
						{...args}
						animation={{
							transition: {
								trigger: progress,
								from: {
									width: "0px",
								},
								to: {
									width: `${targetWidth}px`,
								},
								duration: 2000,
								easing: "linear",
								onBeforeStart: () =>
									console.log(
										`Transitioning to ${progress}%`
									),
								onAfterEnd: () =>
									console.log(
										`Transition complete at ${progress}%`
									),
							},
						}}
					/>
				</div>
			</div>
		);
	},
};

export const CombinedEnterExitTransition: Story = {
	args: {
		baseProps: {
			sx: {
				padding: "20px",
				backgroundColor: "#9b59b6",
				color: "white",
				borderRadius: "8px",
				minWidth: "150px",
				textAlign: "center",
			},
		},
	},
	render: (args) => {
		const [isVisible, setIsVisible] = useState(true);
		const [counter, setCounter] = useState(0);

		return (
			<div>
				<div style={{ marginBottom: "20px" }}>
					<button
						onClick={() => setIsVisible((prev) => !prev)}
						style={{ marginRight: "8px" }}
					>
						{isVisible ? "Hide" : "Show"}
					</button>
					<button
						onClick={() => setCounter((prev) => prev + 1)}
						disabled={!isVisible}
					>
						Increment Counter
					</button>
				</div>
				<AnimatedBox
					{...args}
					isVisible={isVisible}
					animation={{
						enter: {
							from: { yBlocks: -2, opacity: 0 },
							to: { yBlocks: 0, opacity: 1 },
							duration: 300,
							easing: "ease-out",
						},
						exit: {
							from: { opacity: 1 },
							to: { opacity: 0 },
							duration: 300,
							easing: "ease-in",
						},
						transition: {
							trigger: counter,
							frames: [
								{ percent: 0, styles: "transform: scale(1);" },
								{
									percent: 50,
									styles: "transform: scale(1.2);",
								},
								{
									percent: 100,
									styles: "transform: scale(1);",
								},
							],
							duration: 300,
							easing: "ease-in-out",
						},
					}}
				>
					Counter: {counter}
				</AnimatedBox>
			</div>
		);
	},
};

export const RandomPosition: Story = {
	args: {
		baseProps: {
			sx: {
				position: "relative",
				width: "300px",
				height: "200px",
				backgroundColor: "#f0f0f0",
				border: "2px solid #333",
				borderRadius: "8px",
				overflow: "hidden",
			},
		},
		children: null,
	},
	render: (args) => {
		const containerWidth = 300;
		const containerHeight = 200;
		const blockSize = 8;
		const maxWidthBlocks = Math.floor(containerWidth / blockSize);
		const maxHeightBlocks = Math.floor(containerHeight / blockSize);

		const [state, setState] = useState({
			xBlocks: 5,
			yBlocks: 5,
			width: 80,
			height: 60,
		});

		const generateRandomState = () => {
			const randomXBlocks = Math.floor(
				Math.random() * (maxWidthBlocks - 10)
			);
			const randomYBlocks = Math.floor(
				Math.random() * (maxHeightBlocks - 7)
			);
			const randomWidth = Math.floor(Math.random() * 120) + 40;
			const randomHeight = Math.floor(Math.random() * 80) + 30;

			setState({
				xBlocks: randomXBlocks,
				yBlocks: randomYBlocks,
				width: randomWidth,
				height: randomHeight,
			});
		};

		return (
			<div>
				<div style={{ marginBottom: "20px" }}>
					<button onClick={generateRandomState}>
						Randomize Position & Size
					</button>
				</div>
				<div
					style={{
						position: "relative",
						width: "300px",
						height: "200px",
						backgroundColor: "#f0f0f0",
						border: "2px solid #333",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					<AnimatedBox
						baseProps={{
							sx: {
								position: "absolute",
								backgroundColor: "#4a9eff",
								borderRadius: "4px",
								boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
							},
						}}
						animation={{
							transition: {
								trigger: `${state.xBlocks}-${state.yBlocks}-${state.width}-${state.height}`,
								from: {
									xBlocks: 0,
									yBlocks: 0,
									width: "40px",
									height: "30px",
								},
								to: {
									xBlocks: state.xBlocks,
									yBlocks: state.yBlocks,
									width: `${state.width}px`,
									height: `${state.height}px`,
								},
								duration: 600,
								easing: "ease-in-out",
								onBeforeStart: () =>
									console.log(
										`Moving to (${state.xBlocks}, ${state.yBlocks}) - ${state.width}x${state.height}`
									),
								onAfterEnd: () =>
									console.log("Animation complete"),
							},
						}}
					/>
				</div>
			</div>
		);
	},
};

export const PixelTranslation: Story = {
	args: {
		baseProps: {
			sx: {
				position: "relative",
				width: "400px",
				height: "300px",
				backgroundColor: "#f5f5f5",
				border: "2px solid #333",
				borderRadius: "8px",
				overflow: "hidden",
			},
		},
		children: null,
	},
	render: (args) => {
		const [position, setPosition] = useState({ x: 0, y: 0 });
		const [prevPosition, setPrevPosition] = useState({ x: 0, y: 0 });

		const presets = [
			{ x: 0, y: 0, label: "Top Left" },
			{ x: 300, y: 0, label: "Top Right" },
			{ x: 300, y: 200, label: "Bottom Right" },
			{ x: 0, y: 200, label: "Bottom Left" },
			{ x: 150, y: 100, label: "Center" },
		];

		const handlePositionChange = (newPos: { x: number; y: number }) => {
			setPrevPosition(position);
			setPosition(newPos);
		};

		return (
			<div>
				<div
					style={{
						marginBottom: "20px",
						display: "flex",
						gap: "8px",
					}}
				>
					{presets.map((preset) => (
						<button
							key={preset.label}
							onClick={() =>
								handlePositionChange({
									x: preset.x,
									y: preset.y,
								})
							}
						>
							{preset.label}
						</button>
					))}
				</div>
				<div
					style={{
						position: "relative",
						width: "400px",
						height: "300px",
						backgroundColor: "#f5f5f5",
						border: "2px solid #333",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					<AnimatedBox
						baseProps={{
							sx: {
								position: "absolute",
								backgroundColor: "#e74c3c",
								color: "white",
								borderRadius: "4px",
								width: "100px",
								height: "100px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: "bold",
								boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
							},
						}}
						animation={{
							transition: {
								trigger: `${position.x}-${position.y}`,
								from: {
									x: prevPosition.x,
									y: prevPosition.y,
								},
								to: {
									x: position.x,
									y: position.y,
								},
								duration: 800,
								easing: "linear",
							},
						}}
					>
						x: {position.x}
						<br />
						y: {position.y}
					</AnimatedBox>
				</div>
			</div>
		);
	},
};
