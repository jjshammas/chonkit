import { createComponentVariantThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { useComponentTheme } from "@/hooks/useComponentTheme";
import clsx from "clsx";
import React from "react";
import { Box, BoxProps, boxVisual } from "../Box/Box";
import styles from "./TextInput.module.css";

const textInputVisual = createComponentVisualTypes({
	style: {
		...boxVisual.style,
	},
	interactionAllowedKeys: [...boxVisual.interactionAllowedKeys] as const,
});

const textInputThemeTypes = createComponentVariantThemeTypes({
	base: textInputVisual.types.VisualStyle,
	interactionAllowedKeys: textInputVisual.interactionAllowedKeys,
});

export type TextInputVisualStyle = typeof textInputVisual.types.VisualStyle;
export type TextInputVisualProps = typeof textInputVisual.types.Props;
export type TextInputTheme = typeof textInputThemeTypes.types.Theme;
export type TextInputThemeProps = typeof textInputThemeTypes.types.Props;

export interface TextInputProps
	extends Omit<BoxProps, "children">,
		TextInputVisualProps,
		TextInputThemeProps {
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	size?: "sm" | "base" | "lg";
	disabled?: boolean;
}

export const TextInput: React.FC<TextInputProps> = (props) => {
	const {
		inputProps,
		size,
		className,
		containerProps,
		disabled,
		...rest
	} = useComponentTheme("TextInput", props);

	const { className: inputClassName, disabled: inputDisabled, ...inputRest } =
		inputProps ?? {};
	const isDisabled = disabled || inputDisabled;

	return (
		<Box
			{...rest}
			className={clsx(styles.textInputInner, className)}
			containerProps={{
				...containerProps,
				className: clsx(styles.textInputContainer, containerProps?.className),
				"aria-disabled": isDisabled ? "true" : undefined,
				"data-disabled": isDisabled ? "true" : undefined,
			}}
		>
			<input
				{...inputRest}
				disabled={isDisabled}
				className={clsx(styles.input, size && styles[size], inputClassName)}
			/>
		</Box>
	);
};
