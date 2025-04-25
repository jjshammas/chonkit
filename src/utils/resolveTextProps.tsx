import { Text } from "@/components/Text/Text";
import React, { ReactNode } from "react";

// Type that replaces string properties with ReactNode
type TextifiedProps<T> = {
	[K in keyof T]: T[K] extends string ? ReactNode : T[K];
};

export function resolveTextProps<T extends Record<string, any>>(
	props: T,
	keys?: (keyof T)[]
): TextifiedProps<T> {
	const result = {} as TextifiedProps<T>;

	for (const key in props) {
		const value = props[key];

		const shouldTextify = !keys || keys.includes(key);

		if (shouldTextify && typeof value === "string") {
			result[key] = (
				<Text>{value}</Text>
			) as TextifiedProps<T>[typeof key];
		} else {
			result[key] = value as TextifiedProps<T>[typeof key];
		}
	}

	return result;
}
