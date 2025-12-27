import type { Meta, StoryObj } from "@storybook/react";

import { AnimatedBox } from "@/components/AnimatedBox/AnimatedBox";
import { ChonkitProvider } from "@/core/ChonkitProvider/ChonkitProvider";
import { useState } from "react";

const EmptyComponent = ({ children }: { children: React.ReactNode }) =>
	children;

/**
 * Animation examples for the documentation page
 */
const meta = {
	title: "Animations",
	component: EmptyComponent,
	tags: ["!autodocs", "!dev"],
	parameters: {
		disableWrapper: true,
	},
} satisfies Meta<typeof EmptyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicEnterExit: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={2} stepRateHz={24}>
				<BasicEnterExitDemo />
			</ChonkitProvider>
		),
	},
};

function BasicEnterExitDemo() {
	const [isVisible, setIsVisible] = useState(true);

	return (
		<div style={{ padding: "20px" }}>
			<button
				onClick={() => setIsVisible((prev) => !prev)}
				style={{ marginBottom: "20px" }}
			>
				Toggle Visibility
			</button>
			<AnimatedBox
				isVisible={isVisible}
				baseProps={{
					sx: {
						backgroundColor: "#4a9eff",
						padding: "20px",
						borderRadius: "4px",
					},
				}}
				animation={{
					enter: {
						from: { yBlocks: -4, opacity: 0 },
						to: { yBlocks: 0, opacity: 1 },
						duration: 300,
						easing: "ease-out",
					},
					exit: {
						from: { xBlocks: 0, opacity: 1 },
						to: { xBlocks: -10, opacity: 0 },
						duration: 500,
						easing: "ease-in",
					},
				}}
			>
				<div style={{ color: "white" }}>
					I slide down on enter, left on exit!
				</div>
			</AnimatedBox>
		</div>
	);
}

export const BlockBasedMovement: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={3} stepRateHz={24} showGrid>
				<BlockBasedDemo />
			</ChonkitProvider>
		),
	},
};

function BlockBasedDemo() {
	const [trigger, setTrigger] = useState(0);

	return (
		<div style={{ padding: "20px", height: "300px", position: "relative" }}>
			<button
				onClick={() => setTrigger((prev) => prev + 1)}
				style={{ marginBottom: "20px" }}
			>
				Move Across Grid
			</button>
			<AnimatedBox
				baseProps={{
					sx: {
						backgroundColor: "#ff6b6b",
						width: "60px",
						height: "60px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
						fontWeight: "bold",
					},
				}}
				animation={{
					transition: {
						trigger,
						from: { xBlocks: 0, yBlocks: 0 },
						to: { xBlocks: 10, yBlocks: 5 },
						duration: 800,
					},
				}}
			>
				Box
			</AnimatedBox>
		</div>
	);
}

export const PixelBasedSizing: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={2} stepRateHz={20}>
				<PixelBasedDemo />
			</ChonkitProvider>
		),
	},
};

function PixelBasedDemo() {
	const [trigger, setTrigger] = useState(0);
	const sizes = [
		{ width: "50px", height: "50px" },
		{ width: "120px", height: "80px" },
		{ width: "80px", height: "120px" },
	];
	const currentSize = sizes[trigger % sizes.length];

	return (
		<div style={{ padding: "20px" }}>
			<button
				onClick={() => setTrigger((prev) => prev + 1)}
				style={{ marginBottom: "20px" }}
			>
				Change Size
			</button>
			<AnimatedBox
				baseProps={{
					sx: {
						backgroundColor: "#51cf66",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
						fontWeight: "bold",
					},
				}}
				animation={{
					transition: {
						trigger,
						from: { width: "50px", height: "50px" },
						to: currentSize,
						duration: 600,
					},
				}}
			>
				Resize
			</AnimatedBox>
		</div>
	);
}

export const OpacityStepping: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={2} stepRateHz={8}>
				<OpacityDemo />
			</ChonkitProvider>
		),
	},
};

function OpacityDemo() {
	const [trigger, setTrigger] = useState(0);

	return (
		<div style={{ padding: "20px" }}>
			<button
				onClick={() => setTrigger((prev) => prev + 1)}
				style={{ marginBottom: "20px" }}
			>
				Fade In/Out (8 steps at 8Hz)
			</button>
			<AnimatedBox
				baseProps={{
					sx: {
						backgroundColor: "#ffd43b",
						padding: "30px",
						borderRadius: "4px",
					},
				}}
				animation={{
					transition: {
						trigger,
						from: { opacity: 0 },
						to: { opacity: 1 },
						duration: 1000,
					},
				}}
			>
				<div>Watch the stepped opacity fade!</div>
			</AnimatedBox>
		</div>
	);
}

export const HertzComparison: Story = {
	args: {
		children: (
			<div style={{ padding: "20px" }}>
				<HertzComparisonDemo />
			</div>
		),
	},
};

function HertzComparisonDemo() {
	const [trigger, setTrigger] = useState(0);

	return (
		<div>
			<button
				onClick={() => setTrigger((prev) => prev + 1)}
				style={{ marginBottom: "20px" }}
			>
				Move All Boxes
			</button>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "20px",
				}}
			>
				{[
					{ hz: 12, color: "#e03131" },
					{ hz: 24, color: "#f59f00" },
					{ hz: 30, color: "#37b24d" },
					{ hz: 60, color: "#1971c2" },
				].map(({ hz, color }) => (
					<div key={hz}>
						<div
							style={{ marginBottom: "8px", fontWeight: "bold" }}
						>
							{hz} Hz
						</div>
						<ChonkitProvider blockSize={2} stepRateHz={hz}>
							<AnimatedBox
								baseProps={{
									sx: {
										backgroundColor: color,
										width: "60px",
										height: "40px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										color: "white",
										fontSize: "12px",
									},
								}}
								animation={{
									transition: {
										trigger,
										from: { xBlocks: 0 },
										to: { xBlocks: 30 },
										duration: 1000,
									},
								}}
							>
								{hz}Hz
							</AnimatedBox>
						</ChonkitProvider>
					</div>
				))}
			</div>
		</div>
	);
}

export const TransitionDemo: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={2} stepRateHz={24}>
				<TransitionDemoComponent />
			</ChonkitProvider>
		),
	},
};

function TransitionDemoComponent() {
	const positions = [
		{ x: 0, y: 0 },
		{ x: 10, y: 0 },
		{ x: 10, y: 8 },
		{ x: 0, y: 8 },
	];
	const [index, setIndex] = useState(0);
	const position = positions[index % positions.length];

	return (
		<div style={{ padding: "20px", height: "250px", position: "relative" }}>
			<button
				onClick={() => setIndex((prev) => prev + 1)}
				style={{ marginBottom: "20px" }}
			>
				Move to Next Corner
			</button>
			<AnimatedBox
				baseProps={{
					sx: {
						backgroundColor: "#9775fa",
						width: "80px",
						height: "80px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
						fontWeight: "bold",
					},
				}}
				animation={{
					transition: {
						trigger: position,
						from: { xBlocks: position.x, yBlocks: position.y },
						to: { xBlocks: position.x, yBlocks: position.y },
						duration: 400,
					},
				}}
			>
				Box
			</AnimatedBox>
		</div>
	);
}

export const SynchronizedAnimation: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={2} stepRateHz={24}>
				<SynchronizedDemo />
			</ChonkitProvider>
		),
	},
};

function SynchronizedDemo() {
	const [trigger, setTrigger] = useState(0);
	const states = [
		{
			xBlocks: 0,
			yBlocks: 0,
			width: "60px",
			height: "60px",
			opacity: 0.5,
		},
		{
			xBlocks: 15,
			yBlocks: 8,
			width: "120px",
			height: "40px",
			opacity: 1,
		},
	];
	const state = states[trigger % states.length];

	return (
		<div style={{ padding: "20px", height: "300px", position: "relative" }}>
			<button
				onClick={() => setTrigger((prev) => prev + 1)}
				style={{ marginBottom: "20px" }}
			>
				Animate All Properties
			</button>
			<AnimatedBox
				baseProps={{
					sx: {
						backgroundColor: "#20c997",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "white",
						fontWeight: "bold",
					},
				}}
				animation={{
					transition: {
						trigger,
						from: states[0],
						to: state,
						duration: 800,
					},
				}}
			>
				Multi
			</AnimatedBox>
		</div>
	);
}
