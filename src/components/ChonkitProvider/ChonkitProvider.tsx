import React, {
	createContext,
	ReactNode,
	useContext,
	useRef,
	useState,
} from "react";

interface ChonkitContextValue {
	blockSize: number;
	rootAncestor: React.RefObject<HTMLDivElement | null>;
}

const ChonkitContext = createContext<ChonkitContextValue | undefined>(
	undefined
);

export interface ChonkitProviderProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	blockSize: number;
	showGrid?: boolean;
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
			}}
		/>
	);
};

export const ChonkitProvider: React.FC<ChonkitProviderProps> = ({
	children,
	blockSize = 2,
	showGrid,
	style,
	...rest
}) => {
	const rootAncestor = useRef<HTMLDivElement>(null);

	const addlStyle = {
		"--chonkit-block-size": `${blockSize}px`,
	} as React.CSSProperties;

	if (showGrid) {
		addlStyle.position = "relative";
	}

	return (
		<ChonkitContext.Provider
			value={{ blockSize, rootAncestor: rootAncestor }}
		>
			<div
				ref={rootAncestor}
				style={{
					...style,
					...addlStyle,
				}}
				className={`chonkit-root ${rest.className}`}
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
