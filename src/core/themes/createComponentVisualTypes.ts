import type { WithInteractionStates } from "@/core/themes";
import {
	STATE_KEYS,
	InteractionState,
} from "@/components/Box/createVisualStyle";

type WithStateKeys<K extends string> =
	| K
	| `${K}-${Exclude<InteractionState, ""> extends `_${infer S}` ? S : never}`;

export function createComponentVisualTypes<
	T extends Record<string, any> & { [key: string]: any },
	Allowed extends readonly (keyof T & string)[]
>(config: { style: Partial<T>; interactionAllowedKeys?: Allowed }) {
	const visualKeys = Object.keys(config.style) as (keyof T & string)[];
	const interactionAllowedKeys = config.interactionAllowedKeys ?? visualKeys;
	const style = config.style;

	const allKeys = visualKeys.flatMap((key) => {
		return [
			key,
			...STATE_KEYS.map(
				(state) =>
					`${key}-${state.slice(1)}` as WithStateKeys<
						keyof T & string
					>
			),
		];
	}) as WithStateKeys<keyof T & string>[];

	type VisualStyle = Partial<Pick<T, keyof T>>;
	type InteractionSubset = Partial<Pick<T, Allowed[number]>>;
	type InteractionProps = WithInteractionStates<InteractionSubset>;
	type Props = VisualStyle & InteractionProps;

	return {
		style,
		baseKeys: visualKeys,
		allKeys,
		interactionAllowedKeys: interactionAllowedKeys as Allowed,
		types: {
			VisualStyle: null! as VisualStyle,
			InteractionProps: null! as InteractionProps,
			Props: null! as Props,
		},
	};
}
