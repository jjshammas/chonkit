import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		lib: {
			entry: "src/index.ts",
			name: "Chonkit",
			fileName: (format) => `chonkit.${format}.js`,
			formats: ["es", "umd"],
		},
		outDir: "dist",
		rollupOptions: {
			external: ["react", "react-dom"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
				assetFileNames: (assetInfo) => {
					if (assetInfo.name && assetInfo.name.endsWith(".css")) {
						return "chonkit.css";
					}
					return "[name]-[hash][extname]";
				},
			},
		},
		cssCodeSplit: true,
	},
	css: {
		modules: {
			// Customize the generated class name pattern for CSS modules.
			// This example yields names like Button__button___abc12.
			generateScopedName: "[name]__[local]___[hash:base64:5]",
		},
	},
});
