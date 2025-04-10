import React, { ReactNode } from "react";
import { Box, BoxProps } from "../Box/Box";
import styles from "./Button.module.css";

export interface ButtonProps extends BoxProps {
	as?: React.ElementType;
	children?: ReactNode;
	borderRadius?: number;
	snap?: boolean;
	snapMethod?: "transform" | "padding";
}

export const Button: React.FC<ButtonProps> = ({ as, children, ...rest }) => {
	return (
		<Box
			as="a"
			className={styles.button}
			containerProps={{ className: styles.buttonContainer }}
			{...rest}
		>
			{children}
		</Box>
	);
};
