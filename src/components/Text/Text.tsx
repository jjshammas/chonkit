import { ReactNode } from "react";
import styles from "./Text.module.css";
import clsx from "clsx";

export const Text = ({
	children,
	size,
}: {
	children: ReactNode;
	size?: "sm" | "base" | "lg";
}) => {
	return (
		<span className={clsx(styles.text, size && styles[size])}>
			{children}
		</span>
	);
};
