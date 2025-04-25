import { ReactNode } from "react";
import { createComponentThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { WithoutInteractionStates } from "@/core/themes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import { Box, BoxProps, boxVisual } from "@/components/Box/Box";

const panelVisual = createComponentVisualTypes({
	style: {
		...boxVisual.style,
	},
	interactionAllowedKeys: [...boxVisual.interactionAllowedKeys] as const,
});

const panelThemeTypes = createComponentThemeTypes({
	base: panelVisual.types.VisualStyle,
	interactionAllowedKeys: panelVisual.interactionAllowedKeys,
});

export type PanelVisualStyle = typeof panelVisual.types.VisualStyle;
export type PanelVisualProps = typeof panelVisual.types.Props;
export type PanelTheme = typeof panelThemeTypes.types.Theme;
export type PanelThemeProps = typeof panelThemeTypes.types.Props;

export interface PanelProps
	extends WithoutInteractionStates<BoxProps>,
		PanelThemeProps {
	as?: React.ElementType;
	children?: ReactNode;
	disabled?: boolean;
	size?: "sm" | "base" | "lg";
}

export const Panel: React.FC<PanelProps> = (props) => {
	const { ...rest } = useComponentTheme("Panel", props);

	return <Box {...rest} />;
};
