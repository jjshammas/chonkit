# chonkit

Chonkit is a React UI library for building chonky pixel art interfaces
without losing the power of CSS.

## Features

- **Pixel-perfect layouts**: Design with blocks instead of pixels to ensure pixel grid alignment
- **Dynamic lighting**: Easily add dynamic lighting effects to your components
- **Theming support**: Customize colors and styles with theming capabilities
- **Dithering effects**: Apply dithering to your components for authentic pixel art aesthetics

## Live preview

View previews on the **[documentation site](https://jjshammas.github.io/chonkit)**.

## Installation

Chonkit is not yet hosted on npm. Check the Building section below to build locally.

## Usage

Use `ChonkitProvider` and `LightingProvider` to set up your app, then use components like `Button` inside:

```tsx
import { ChonkitProvider, LightingProvider, Button } from "chonkit";
import "node_modules/chonkit/dist/chonkit.css";

export function Example() {
	return (
		<ChonkitProvider blockSize={5} showGrid={false}>
			<LightingProvider direction={135}>
				<Button>Launch</Button>
			</LightingProvider>
		</ChonkitProvider>
	);
}
```

Importing the `chonkit.css file` is required, however, no styles will be applied to your webpage outside of the components you wrap in `ChonkitProvider`. This means you can safely use Chonkit alongside other CSS frameworks and libraries without worrying about style conflicts.

## Where should I use Chonkit?

Pixel graphic effects (like pixelated corners or gradients) are normally achieved using bitmap images or canvas rendering. Chonkit allows you to build pixel art interfaces using normal CSS. This means you can do things like:

- Use CSS layout techniques like Flexbox and Grid
- Create completely responsive pixel art designs
- Utilize CSS interaction states like `:hover` and `:active`

In short:

✅ **If you are making a website or webapp with a pixel art style,** Chonkit gives you perfect pixel art effects without sacrificing the power of CSS.

❌ **If you are making a game,** Chonkit is probably not the right tool, unless you are already using React for your game UI.

## Building

Checkout the repo and run:

```
npm install
npm run build
npm run storybook
```

This will open a storybook server to watch for changes.
