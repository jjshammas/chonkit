import type { Theme } from "..";

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
		defaultVariant: "primary",
		borderSize: 1,
		borderRadius: 6,
		borderColor: "rgba(0,0,0,0.3)",
		bevelHighlightSize: 2,
		bevelShadowSize: 1,
		backgroundColor: "secondary",
		color: "secondary.fg",
		dropShadow: "1 1 rgba(0,0,0,0.2)",

		_hover: {
			backgroundColor: "black",
			borderColor: "black",
		},

		variants: {
			primary: {
				backgroundColor: "primary",
				color: "primary.fg",

				_hover: {
					backgroundColor: "green",
				},

				_active: {
					backgroundColor: "yellow",
				},
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
};

export default defaultTheme;
