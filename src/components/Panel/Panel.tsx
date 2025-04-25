import { act, ReactNode } from "react";
import { createComponentThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { WithoutInteractionStates } from "@/core/themes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import { Box, BoxProps, boxVisual } from "@/components/Box/Box";
import { PanelControlBar } from "./PanelControlBar";
import { PanelActionBar } from "./PanelActionBar";

const panelVisual = boxVisual;

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
	controlBarLeft?: ReactNode;
	controlBarRight?: ReactNode;
	controlBarCenter?: ReactNode;
	actionBarLeft?: ReactNode;
	actionBarRight?: ReactNode;
}

export const Panel: React.FC<PanelProps> = (props) => {
	const {
		controlBarLeft,
		controlBarCenter,
		controlBarRight,
		actionBarLeft,
		actionBarRight,
		children,
		padding,
		...rest
	} = useComponentTheme("Panel", props);

	return (
		<Box {...rest}>
			{(controlBarLeft || controlBarCenter || controlBarRight) && (
				<PanelControlBar
					left={controlBarLeft}
					center={controlBarCenter}
					right={controlBarRight}
				/>
			)}
			<Box padding={padding}>{children}</Box>
			{(actionBarLeft || actionBarRight) && (
				<PanelActionBar left={actionBarLeft} right={actionBarRight} />
			)}
		</Box>
	);
};
