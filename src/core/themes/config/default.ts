import type { Theme } from "..";

const defaultTheme: Theme = {
	breakpoints: {
		xs: 0,
		sm: 640,
		md: 768,
		lg: 1024,
		xl: 1280,
		"2xl": 1536,
	},
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
		highlightColor: "rgba(255, 255, 255, 0.2)",
		highlightBlendMode: "plus-lighter",
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
			disabled: {
				bevelHighlightSize: 0,
				bevelShadowSize: 0,
			},
		},
	},
	TextInput: {
		defaultVariant: "default",
		borderWidth: 1,
		borderRadius: 4,
		borderColor: "rgba(0,0,0,0.3)",
		backgroundColor: "secondary",
		color: "secondary.fg",
		padding: "8px 10px 6px",

		_focus: {
			backgroundColor: "bg",
			borderColor: "primary",
		},

		_disabled: {
			backgroundColor: "disabled",
			color: "disabled.fg",
			borderColor: "rgba(0,0,0,0.2)",
		},

		variants: {
			default: {},
		},
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
