import { ReactNode } from "react";
import { createComponentThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { WithoutInteractionStates } from "@/core/themes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import { Box, BoxProps, boxVisual } from "@/components/Box/Box";
import styles from "./Panel.module.css";
import clsx from "clsx";
import { resolveTextProps } from "@/utils/resolveTextProps";

const panelControlBarVisual = boxVisual;

const panelControlBarThemeTypes = createComponentThemeTypes({
	base: panelControlBarVisual.types.VisualStyle,
	interactionAllowedKeys: panelControlBarVisual.interactionAllowedKeys,
});

export type PanelControlBarVisualStyle =
	typeof panelControlBarVisual.types.VisualStyle;
export type PanelControlBarVisualProps =
	typeof panelControlBarVisual.types.Props;
export type PanelControlBarTheme = typeof panelControlBarThemeTypes.types.Theme;
export type PanelControlBarThemeProps =
	typeof panelControlBarThemeTypes.types.Props;

export interface PanelControlBarProps
	extends WithoutInteractionStates<BoxProps>,
		PanelControlBarThemeProps {
	left?: ReactNode;
	center?: ReactNode;
	right?: ReactNode;
}

export const PanelControlBar: React.FC<PanelControlBarProps> = (props) => {
	const { left, center, right, ...rest } = resolveTextProps(
		useComponentTheme("PanelControlBar", props),
		["left", "center", "right"]
	);

	return (
		<Box {...rest} className={clsx(styles.controlBar, props.className)}>
			<div>{left}</div>
			<div>{center}</div>
			<div>{right}</div>
		</Box>
	);
};
