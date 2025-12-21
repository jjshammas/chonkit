import type { Meta, StoryObj } from "@storybook/react";

import { ChonkitProvider } from "@/core/ChonkitProvider/ChonkitProvider";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";

const EmptyComponent = ({ children }: { children: React.ReactNode }) =>
	children;

const meta = {
	title: "Introduction",
	component: EmptyComponent,
	tags: ["!autodocs", "!dev"],
	parameters: {
		disableWrapper: true,
	},
} satisfies Meta<typeof EmptyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const InnerExample = () => (
	<Box
		sx={{
			borderRadius: 6,
			dropShadow: "0 1 2 #ccc",
		}}
	>
		<Box
			sx={{
				padding: "10px",
				backgroundGradient:
					"90deg, #dedfe8, #b8b9c7 10%, #b8b9c7 40%, #9596a5",
				bevelHighlightSize: 1,
				bevelShadowSize: 1,
			}}
		>
			<Box
				sx={{
					background: "#2a409a",
					color: "#fff",
					padding: "6px",
					borderRadius: 3,
					embossHighlightSize: 1,
					embossShadowSize: 1,
					borderSize: 1,
					borderColor: "#000",
					display: "inline-block",
				}}
			>
				Welcome to Chonkit
			</Box>
		</Box>
		<Box
			sx={{
				backgroundGradient: "90deg, #3f404f, #6b6c7e",
			}}
		>
			<Box
				sx={{
					padding: "10px",
					flexDirection: "row",
					display: "flex",
					gap: 4,
				}}
			>
				<Box
					sx={{
						padding: "12px",
						flex: 1,
						backgroundColor: "#21222c",
						color: "#ddd",
						textAlign: "center",
						borderRadius: 4,
						embossHighlightSize: 1,
						embossShadowSize: 1,
					}}
				>
					Full CSS positioning support, like flex box
				</Box>
				<Box
					sx={{
						padding: "12px",
						flex: 1,
						backgroundColor: "#21222c",
						color: "#ddd",
						textAlign: "center",
						borderRadius: 4,
						embossHighlightSize: 1,
						embossShadowSize: 1,
					}}
				>
					Try resizing the window!
				</Box>
			</Box>
		</Box>
	</Box>
);

export const Default: Story = {
	args: {
		children: (
			<ChonkitProvider blockSize={1.5}>
				<InnerExample />
			</ChonkitProvider>
		),
	},
};
