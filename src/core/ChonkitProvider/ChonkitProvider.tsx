import React, {
	createContext,
	ReactNode,
	useContext,
	useRef,
	useState,
	useEffect,
} from "react";
import clsx from "clsx";
import themes, {
	Theme,
	ThemePartial,
	createCSSVariables,
	mergeThemes,
} from "@/core/themes";

interface ChonkitContextValue {
	blockSize: number;
	rootAncestor: React.RefObject<HTMLDivElement | null>;
	theme: Theme;
	viewportWidth: number;
}

const ChonkitContext = createContext<ChonkitContextValue | undefined>(
	undefined
);

export interface ChonkitProviderProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	blockSize: number;
	showGrid?: boolean;
	theme?: Theme | ThemePartial | keyof typeof themes;
}

const Grid = ({ blockSize }: { blockSize: number }) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				background: `repeating-conic-gradient(rgba(0,0,0,0.1) 0% 25%, transparent 0% 50%) 50% / 20px 20px`,
				backgroundPosition: "0 0",
				backgroundSize: `${blockSize * 2}px ${blockSize * 2}px`,
				zIndex: 1000,
			}}
		/>
	);
};

export const ChonkitProvider: React.FC<ChonkitProviderProps> = ({
	children,
	blockSize = 2,
	showGrid,
	style,
	theme: rawTheme,
	...rest
}) => {
	const rootAncestor = useRef<HTMLDivElement>(null);

	const [viewportWidth, setViewportWidth] = useState<number>(
		typeof window !== "undefined" ? window.innerWidth : 0
	);
	useEffect(() => {
		let raf = 0 as number | undefined;
		const onResize = () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				setViewportWidth(window.innerWidth);
			});
		};
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	const theme =
		typeof rawTheme === "string"
			? themes[rawTheme as keyof typeof themes]
			: typeof rawTheme === "object"
				? mergeThemes(themes.default, rawTheme)
				: themes.default;

	const addlStyle = {
		"--ck-block-size": `${blockSize}px`,
		...createCSSVariables(theme),
	} as React.CSSProperties;

	if (showGrid) {
		addlStyle.position = "relative";
	}

	return (
		<ChonkitContext.Provider
			value={{
				blockSize,
				rootAncestor: rootAncestor,
				theme,
				viewportWidth,
			}}
		>
			<div
				ref={rootAncestor}
				style={{
					...style,
					...addlStyle,
				}}
				className={clsx("chonkit-root", rest.className)}
				{...rest}
			>
				{children}
				{showGrid && <Grid blockSize={blockSize} />}
			</div>
		</ChonkitContext.Provider>
	);
};

export const useChonkit = (): ChonkitContextValue => {
	const context = useContext(ChonkitContext);
	if (!context) {
		throw new Error("useChonkit must be used within a ChonkitProvider");
	}
	return context;
};
