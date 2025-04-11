import React, { createContext, ReactNode, useContext, useRef } from "react";

export type LightingDirection = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;

interface LightingContextValue {
	direction: LightingDirection;
}

const defaultContext: LightingContextValue = {
	direction: 90,
};

const LightingContext = createContext<LightingContextValue>(defaultContext);

export interface LightingProviderProps extends LightingContextValue {
	children: ReactNode;
}

export const LightingProvider: React.FC<LightingProviderProps> = ({
	direction,
	children,
}) => {
	return (
		<LightingContext.Provider value={{ direction }}>
			{children}
		</LightingContext.Provider>
	);
};

export const useLighting = (): LightingContextValue => {
	const context = useContext(LightingContext);
	if (!context) {
		return defaultContext;
	}
	return context;
};

export const rotateDirection = (
	direction: LightingDirection,
	rotation: LightingDirection
): LightingDirection => {
	const newDirection = (direction + rotation) % 360;
	return newDirection as LightingDirection;
};
