import type { Meta, StoryObj } from "@storybook/react";

import { ChonkitProvider } from "@/core/ChonkitProvider/ChonkitProvider";
import { Box } from "@/components/Box/Box";
import { Button } from "@/components/Button/Button";
import { AnimatedBox } from "@/components/AnimatedBox/AnimatedBox";
import { useState, useEffect } from "react";

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

const InnerExample = () => {
	const [position, setPosition] = useState(0);
	const [blockSize, setBlockSize] = useState<number>(2);
	const sizes = [1, 2, 3];

	useEffect(() => {
		const interval = setInterval(() => {
			setPosition((p) => (p + 1) % 2);
		}, 1500);
		return () => clearInterval(interval);
	}, []);

	const boxes = [
		{ hz: 12, color: "#ff6b6b", emoji: "🐢" },
		{ hz: 24, color: "#4ecdc4", emoji: "🏃" },
		{ hz: 60, color: "#95e1d3", emoji: "⚡" },
	];

	return (
		<ChonkitProvider blockSize={blockSize} stepRateHz={24}>
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
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "4px",
						}}
					>
						<Box
							sx={{
								background: "#2a409a",
								color: "#fff",
								padding: "6px 10px",
								borderRadius: 3,
								embossHighlightSize: 1,
								embossShadowSize: 1,
								borderWidth: 1,
								borderColor: "#000",
								display: "inline-block",
								letterSpacing: 1,
							}}
						>
							Welcome to Chonkit
						</Box>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								gap: "2px",
							}}
						>
							<Box sx={{ fontSize: "12px", color: "#333" }}>
								Grid size
							</Box>
							<Box sx={{ display: "flex", gap: "2px" }}>
								{sizes.map((s) => {
									const selected = s === blockSize;
									return (
										<Button
											key={s}
											size="sm"
											onClick={() => setBlockSize(s)}
											sx={{
												backgroundColor: selected
													? "#2a409a"
													: "#fff",
												color: selected
													? "#fff"
													: "#333",
												borderRadius: 2,
												borderWidth: 1,
												borderColor: selected
													? "#000"
													: "#888",
												embossHighlightSize: selected
													? 1
													: 0,
												embossShadowSize: selected
													? 1
													: 0,
											}}
										>
											{s} px
										</Button>
									);
								})}
							</Box>
						</Box>
					</Box>
				</Box>

				<Box
					sx={{
						backgroundGradient: "90deg, #3f404f, #6b6c7e",
						padding: "10px",
						display: "flex",
						flexDirection: "column",
						gap: "8px",
					}}
				>
					{/* Feature 1: CSS Positioning */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							gap: "4px",
							alignItems: "stretch",
						}}
					>
						<Box
							sx={{
								flex: 1,
								backgroundColor: "#21222c",
								color: "#ddd",
								padding: "12px",
								borderRadius: 4,
								embossHighlightSize: 1,
								embossShadowSize: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Box sx={{ textAlign: "center" }}>
								<Box sx={{ marginBottom: "4px" }}>
									Full CSS Positioning
								</Box>
								<Box sx={{ fontSize: "12px", opacity: 0.8 }}>
									Flexbox, Grid, and all modern layout tools
								</Box>
							</Box>
						</Box>
						<Box
							sx={{
								flex: 1,
								backgroundColor: "#21222c",
								padding: "8px",
								borderRadius: 4,
								embossHighlightSize: 1,
								embossShadowSize: 1,
							}}
						>
							<Box
								sx={{
									display: "flex",
									gap: "2px",
									height: "100%",
								}}
							>
								<Box
									sx={{
										flex: 1,
										backgroundColor: "#e76f51",
										borderRadius: 4,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "10px",
										color: "#fff",
									}}
								>
									A
								</Box>
								<Box
									sx={{
										flex: 2,
										display: "flex",
										flexDirection: "column",
										gap: "2px",
									}}
								>
									<Box
										sx={{
											flex: 1,
											backgroundColor: "#f4a261",
											borderRadius: 4,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "10px",
											color: "#fff",
										}}
									>
										B
									</Box>
									<Box
										sx={{
											flex: 1,
											backgroundColor: "#e9c46a",
											borderRadius: 4,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											fontSize: "10px",
											color: "#fff",
										}}
									>
										C
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>

					{/* Feature 2: Animations */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							gap: "4px",
							alignItems: "stretch",
						}}
					>
						<Box
							sx={{
								flex: 1,
								backgroundColor: "#1a1d2e",
								color: "#ddd",
								padding: "12px",
								borderRadius: 4,
								embossHighlightSize: 1,
								embossShadowSize: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Box sx={{ textAlign: "center" }}>
								<Box sx={{ marginBottom: "4px" }}>
									Pixel-Grid-Aligned Animations
								</Box>
								<Box sx={{ fontSize: "12px", opacity: 0.8 }}>
									Stair-stepped motion at configurable Hz
									rates
								</Box>
							</Box>
						</Box>
						<Box
							sx={{
								flex: 1,
								backgroundColor: "#1a1d2e",
								padding: "8px",
								borderRadius: 4,
								embossHighlightSize: 1,
								embossShadowSize: 1,
							}}
						>
							<Box
								sx={{
									display: "flex",
									flexDirection: "column",
									gap: "2px",
								}}
							>
								{boxes.map(({ hz, color, emoji }) => (
									<ChonkitProvider
										key={hz}
										blockSize={blockSize}
										stepRateHz={hz}
									>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												gap: "2px",
											}}
										>
											<Box
												sx={{
													minWidth: "40px",
													fontSize: "12px",
													color: "#888",
													textAlign: "right",
												}}
											>
												{hz}Hz
											</Box>
											<Box
												sx={{
													flex: 1,
													position: "relative",
												}}
											>
												<AnimatedBox
													baseProps={{
														sx: {
															backgroundColor:
																color,
															width: "50px",
															height: "24px",
															borderRadius: 2,
															display: "flex",
															alignItems:
																"center",
															justifyContent:
																"center",
															fontSize: "14px",
															embossHighlightSize: 1,
															embossShadowSize: 1,
															borderWidth: 1,
															borderColor:
																"rgba(0,0,0,0.2)",
														},
													}}
													animation={{
														transition: {
															easing: "linear",
															trigger: position,
															from: {
																xBlocks:
																	position ===
																	0
																		? 0
																		: 100,
															},
															to: {
																xBlocks:
																	position ===
																	0
																		? 100
																		: 0,
															},
															duration: 1000,
														},
													}}
												>
													{emoji}
												</AnimatedBox>
											</Box>
										</Box>
									</ChonkitProvider>
								))}
							</Box>
						</Box>
					</Box>

					{/* Feature 3: Dithered Gradients */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "row",
							gap: "4px",
							alignItems: "stretch",
						}}
					>
						<Box
							sx={{
								flex: 1,
								backgroundColor: "#21222c",
								color: "#ddd",
								padding: "12px",
								borderRadius: 4,
								embossHighlightSize: 1,
								embossShadowSize: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Box sx={{ textAlign: "center" }}>
								<Box sx={{ marginBottom: "4px" }}>
									Dithered Gradients
								</Box>
								<Box sx={{ fontSize: "12px", opacity: 0.8 }}>
									Retro pixel-art style gradients with
									dithering
								</Box>
							</Box>
						</Box>
						<Box
							sx={{
								flex: 1,
								backgroundColor: "#21222c",
								padding: "8px",
								borderRadius: 4,
								embossHighlightSize: 1,
								embossShadowSize: 1,
							}}
						>
							<Box
								sx={{
									display: "flex",
									gap: "2px",
									height: "100%",
								}}
							>
								<Box
									sx={{
										flex: 1,
										backgroundGradient:
											"180deg, #667eea, #764ba2",
										borderRadius: 2,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "18px",
									}}
								>
									🎨
								</Box>
								<Box
									sx={{
										flex: 1,
										backgroundGradient:
											"45deg, #f093fb, #f5576c",
										borderRadius: 2,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "18px",
									}}
								>
									✨
								</Box>
								<Box
									sx={{
										flex: 1,
										backgroundGradient:
											"135deg, #4facfe, #00f2fe",
										borderRadius: 2,
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontSize: "18px",
									}}
								>
									🌊
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</ChonkitProvider>
	);
};

export const Default: Story = {
	args: {
		children: <InnerExample />,
	},
};
