import type { Theme } from "..";

const defaultTheme: Theme = {
	palette: {
		bg: {
			main: "#fff",
			fg: "#212529",
		},
		primary: {
			main: "#3b5bdb",
			fg: "#ffffff",
		},
		secondary: {
			main: "#f1f3f5",
			fg: "#212529",
		},
		positive: {
			main: "#37b24d",
			fg: "#ffffff",
		},
		negative: {
			main: "#f03e3e",
			fg: "#ffffff",
		},
		disabled: {
			main: "#dee2e6",
			fg: "#495057",
		},
	},
	lighting: {
		highlightColor: "rgba(255, 255, 255, 0.3)",
		highlightBlendMode: "soft-light",
		shadowColor: "rgba(0, 0, 0, 0.3)",
		shadowBlendMode: "multiply",
	},
	Button: {
		defaultVariant: "primary",
		borderWidth: 1,
		borderRadius: 6,
		borderColor: "rgba(0,0,0,0.3)",
		bevelHighlightSize: 2,
		bevelShadowSize: 1,
		backgroundColor: "secondary",
		color: "secondary.fg",
		dropShadow: "1 1 rgba(0,0,0,0.2)",
		padding: "8px 16px 6px",
		depth: 2,
		depthColor: "#253276",

		_active: {
			depth: 0,
		},

		variants: {
			primary: {
				backgroundColor: "primary",
				color: "primary.fg",
			},
			secondary: {},
			positive: {
				backgroundColor: "positive",
				color: "positive.fg",
			},
			negative: {
				backgroundColor: "negative",
				color: "negative.fg",
			},
			disabled: {},
		},
	},
	Panel: {
		backgroundColor: "bg",
		color: "bg.fg",
		borderRadius: 3,
		borderWidth: 1,
		borderColor: "#aaa",
		bevelHighlightSize: 1,
		bevelShadowSize: 1,
		dropShadow: "4 0 rgba(0,0,0,0.1)",
		padding: "12px",
	},
	PanelControlBar: {
		backgroundColor: "#eee",
		backgroundGradient: "90deg, #eee 60%, #ddd 80%",
		bevelShadowSize: 1,
		embossShadowSize: 1,
		padding: "12px",
	},
	PanelActionBar: {
		padding: "12px",
	},
	ScrollAreaTrack: {
		borderRadius: 2,
		borderColor: "#ccc",
		borderWidth: 1,
		size: "16px",
	},
	ScrollAreaThumb: {
		borderWidth: 1,
		borderRadius: 2,
		borderColor: "rgba(0,0,0,0.3)",
		bevelHighlightSize: 2,
		bevelShadowSize: 1,
		backgroundColor: "secondary",
		size: "12px",
	},
};

export default defaultTheme;
