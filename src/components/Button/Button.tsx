import React, { ReactNode } from "react";
import { Box, BoxProps } from "../Box/Box";
import type {
	VariantComponentTheme,
	VariantComponentThemeProps,
} from "@/core/themes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import styles from "./Button.module.css";

export type ButtonTheme = VariantComponentTheme<
	{
		borderRadius?: BoxProps["borderRadius"];
		borderSize?: BoxProps["borderSize"];
		borderColor?: BoxProps["borderColor"];
		bevelHighlightSize?: BoxProps["bevelHighlightSize"];
		bevelShadowSize?: BoxProps["bevelShadowSize"];
		embossHighlightSize?: BoxProps["embossHighlightSize"];
		embossShadowSize?: BoxProps["embossShadowSize"];
		dropShadow?: BoxProps["dropShadow"];
		backgroundColor?: string;
		backgroundColorHover?: string;
		backgroundColorActive?: string;
	},
	"primary" | "secondary" | "positive" | "negative" | "disabled"
>;

export interface ButtonProps
	extends BoxProps,
		VariantComponentThemeProps<ButtonTheme> {
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
				"data-disabled": disabled ? "true" : undefined,
			}}
			dropShadow={{
				blur: 1,
				distance: 1,
				color: "rgba(0,0,0,0.2)",
			}}
			{...rest}
		>
			{children}
		</Box>
	);
};
