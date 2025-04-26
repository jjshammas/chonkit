import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	staticDirs: ["../src/stories/assets"],
	addons: [
		"@storybook/addon-essentials",
		"@storybook/addon-interactions",
		"@storybook/addon-storysource",
		"@storybook/addon-a11y",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	typescript: {
		reactDocgen: "react-docgen-typescript",
		// reactDocgenTypescriptOptions: {
		// 	shouldExtractLiteralValuesFromEnum: true,
		// 	propFilter: (prop) => {
		// 		if (!prop.parent?.name) {
		// 			return true;
		// 		}

		// 		if (["value", "onChange"].includes(prop.name)) {
		// 			return true;
		// 		}

		// 		if (
		// 			[
		// 				"AriaAttributes",
		// 				"AnchorHTMLAttributes",
		// 				"Attributes",
		// 				"ButtonHTMLAttributes",
		// 				"ClassAttributes",
		// 				"DOMAttributes",
		// 				"HTMLAttributes",
		// 				"InputHTMLAttributes",
		// 			].includes(prop.parent.name)
		// 		) {
		// 			return false;
		// 		}

		// 		if (/node_modules\/typescript/.test(prop.parent.fileName)) {
		// 			return false;
		// 		}

		// 		//if (/node_modules/.test(prop.parent.fileName)) {
		// 		//  console.log('__TEST__', prop.parent.name);
		// 		//  console.log('__TEST__2__', prop);
		// 		//}

		// 		return true;
		// 	},
		// },
	},
};
export default config;
