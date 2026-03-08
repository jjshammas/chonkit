import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChonkitProvider } from "@/core/ChonkitProvider/ChonkitProvider";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";

const EmptyComponent = ({ children }: { children: React.ReactNode }) =>
	children;

/**
 * The wrapping component for the Chonkit library. It provides the context for the
 * library and allows you to set the block size for the grid system.
 * You must wrap your application with this component when using Chonkit components.
 */
const meta = {
	title: "Styling",
	component: EmptyComponent,
	tags: ["!autodocs", "!dev"],
	parameters: {
		disableWrapper: true,
	},
} satisfies Meta<typeof EmptyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={3}>
				<Button>hello,</Button>
			</ChonkitProvider>
		),
	},
};

export const AllBlocks: Story = {
	args: {
		children: (
			<div style={{ display: "flex", flexDirection: "row" }}>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={1} showGrid>
						<div style={{ padding: "12px" }}>
							<Button>Grid size 1</Button>
						</div>
					</ChonkitProvider>
				</div>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={2} showGrid>
						<div style={{ padding: "12px" }}>
							<Button>Grid size 2</Button>
						</div>
					</ChonkitProvider>
				</div>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={3} showGrid>
						<div style={{ padding: "12px" }}>
							<Button>Grid size 3</Button>
						</div>
					</ChonkitProvider>
				</div>
			</div>
		),
	},
};

export const SomeBlocks: Story = {
	args: {
		children: (
			<div style={{ display: "flex", flexDirection: "row" }}>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={1} showGrid>
						<div style={{ padding: "12px" }}>
							<Box
								sx={{
									borderWidth: 1,
									borderColor: "black",
									padding: "8px",
								}}
							>
								I am a box
							</Box>
						</div>
					</ChonkitProvider>
				</div>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={2} showGrid>
						<div style={{ padding: "12px" }}>
							<Box
								sx={{
									borderWidth: 1,
									borderColor: "black",
									padding: "8px",
								}}
							>
								I am a box
							</Box>
						</div>
					</ChonkitProvider>
				</div>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={3} showGrid>
						<div style={{ padding: "12px" }}>
							<Box
								sx={{
									borderWidth: 1,
									borderColor: "black",
									padding: "8px",
								}}
							>
								I am a box
							</Box>
						</div>
					</ChonkitProvider>
				</div>
			</div>
		),
	},
};

export const Snapping: Story = {
	args: {
		children: (
			<div style={{ display: "flex", flexDirection: "row" }}>
				<div style={{ flex: 1 }}>
					<ChonkitProvider blockSize={10} showGrid>
						<Box sx={{ width: "50%", backgroundColor: "#ddd" }}>
							I am 50% width, try resizing the window!
						</Box>
					</ChonkitProvider>
				</div>
			</div>
		),
	},
};
