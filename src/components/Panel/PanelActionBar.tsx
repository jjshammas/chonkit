import { ReactNode } from "react";
import { createComponentThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { WithoutInteractionStates } from "@/core/themes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import { Box, BoxProps, boxVisual } from "@/components/Box/Box";
import styles from "./Panel.module.css";
import clsx from "clsx";
import { resolveTextProps } from "@/utils/resolveTextProps";

const panelActionBarVisual = boxVisual;

const panelActionBarThemeTypes = createComponentThemeTypes({
	base: panelActionBarVisual.types.VisualStyle,
	interactionAllowedKeys: panelActionBarVisual.interactionAllowedKeys,
});

export type PanelActionBarVisualStyle =
	typeof panelActionBarVisual.types.VisualStyle;
export type PanelActionBarVisualProps = typeof panelActionBarVisual.types.Props;
export type PanelActionBarTheme = typeof panelActionBarThemeTypes.types.Theme;
export type PanelActionBarThemeProps =
	typeof panelActionBarThemeTypes.types.Props;

export interface PanelActionBarProps
	extends WithoutInteractionStates<BoxProps>,
		PanelActionBarThemeProps {
	left?: ReactNode;
	right?: ReactNode;
}

export const PanelActionBar: React.FC<PanelActionBarProps> = (props) => {
	const { left, right, ...rest } = resolveTextProps(
		useComponentTheme("PanelActionBar", props),
		["left", "right"]
	);

	return (
		<Box {...rest} className={clsx(styles.actionBar, props.className)}>
			<div>{left}</div>
			<div>{right}</div>
		</Box>
	);
};
