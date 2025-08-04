import React, { ReactNode } from "react";
import { Box, BoxProps, boxVisual } from "../Box/Box";
import { Text } from "../Text/Text";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import styles from "./Button.module.css";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { createComponentVariantThemeTypes } from "@/core/themes/createComponentThemeTypes";
import clsx from "clsx";

const buttonVisual = createComponentVisualTypes({
	style: {
		...boxVisual.style,
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

export interface ButtonProps extends BoxProps {
	as?: React.ElementType;
	children?: ReactNode;
	disabled?: boolean;
	size?: "sm" | "base" | "lg";
}

export const Button: React.FC<ButtonProps> = (props) => {
	const { as, children, disabled, size, ...rest } = useComponentTheme(
		"Button",
		props
	);

	return (
		<Box
			as="a"
			className={clsx(styles.button, size && styles[size])}
			containerProps={{
				className: styles.buttonContainer,
				"aria-disabled": disabled ? "true" : undefined,
			}}
			{...rest}
		>
			<Text size={size}>{children}</Text>
		</Box>
	);
};
