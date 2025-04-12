import type { Theme } from "./";

const defaultTheme: Theme = {
	palette: {
		bg: {
			main: "#ffffff",
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
		highlightColor: "rgba(255, 255, 255, 0.5)",
		highlightBlendMode: "soft-light",
		shadowColor: "rgba(0, 0, 0, 0.2)",
		shadowBlendMode: "multiply",
	},
	Button: {
		variants: {
			primary: {},
			secondary: {},
			positive: {},
			negative: {},
			disabled: {},
		},
		defaultVariant: "primary",
		borderSize: 1,
		borderRadius: 6,
		borderColor: "rgba(0,0,0,0.3)",
		bevelHighlightSize: 1,
		bevelShadowSize: 1,
		backgroundColor: "secondary",
	},
};

export default defaultTheme;
