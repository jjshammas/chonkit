import React, { ReactNode } from "react";
import { Box, BoxProps, boxVisual } from "../Box/Box";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import styles from "./Button.module.css";
import type { WithoutInteractionStates } from "@/core/themes";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { createComponentVariantThemeTypes } from "@/core/themes/createComponentThemeTypes";

const buttonVisual = createComponentVisualTypes({
	style: {
		...boxVisual.style,
		borderSize: undefined as BoxProps["borderSize"],
		borderColor: undefined as BoxProps["borderColor"],
		bevelHighlightSize: undefined as BoxProps["bevelHighlightSize"],
		bevelShadowSize: undefined as BoxProps["bevelShadowSize"],
		embossHighlightSize: undefined as BoxProps["embossHighlightSize"],
		embossShadowSize: undefined as BoxProps["embossShadowSize"],
		dropShadow: undefined as BoxProps["dropShadow"],
	},
	interactionAllowedKeys: [...boxVisual.interactionAllowedKeys] as const,
});

const buttonThemeTypes = createComponentVariantThemeTypes({
	base: buttonVisual.types.VisualStyle,
	interactionAllowedKeys: buttonVisual.interactionAllowedKeys,
});

export type ButtonVisualStyle = typeof buttonVisual.types.VisualStyle;
export type ButtonVisualProps = typeof buttonVisual.types.Props;
export type ButtonTheme = typeof buttonThemeTypes.types.Theme;
export type ButtonThemeProps = typeof buttonThemeTypes.types.Props;

export interface ButtonProps
	extends WithoutInteractionStates<BoxProps>,
		ButtonThemeProps {
	as?: React.ElementType;
	children?: ReactNode;
	disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = (props) => {
	const { as, children, disabled, ...rest } = useComponentTheme(
		"Button",
		props
	);

	return (
		<Box
			as="a"
			className={styles.button}
			containerProps={{
				className: styles.buttonContainer,
				"aria-disabled": disabled ? "true" : undefined,
			}}
			dropShadow={{
				blur: 1,
				distance: 1,
				color: "rgba(0,0,0,0.2)",
			}}
			{...rest}
		>
			{children}
			<Box></Box>
		</Box>
	);
};
