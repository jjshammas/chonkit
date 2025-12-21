import type { WithInteractionStates } from "@/core/themes";
import {
	STATE_KEYS,
	InteractionState,
	BreakpointKey,
} from "@/components/Box/createVisualStyle";

type WithStateKeys<K extends string> =
	| K
	| `${K}-${Exclude<InteractionState, ""> extends `_${infer S}` ? S : never}`;

export function createComponentVisualTypes<
	T extends Record<string, any> & { [key: string]: any },
	Allowed extends readonly (
		| (keyof T & string)
		| (keyof React.CSSProperties & string)
	)[],
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

	type Primitive = string | number | (string | number)[];
	type Responsive<V> = V | Partial<Record<BreakpointKey, V>>;

	type VisualStyle = Partial<
		{
			[key in keyof React.CSSProperties]?: Responsive<Primitive>;
		} & {
			[key in keyof T]?: Responsive<T[key]>;
		}
	>;
	type InteractionSubset = Partial<Pick<T, Allowed[number]>>;
	type InteractionEnabledStyle = WithInteractionStates<InteractionSubset>;
	type Props = {
		sx?: VisualStyle & InteractionEnabledStyle;
	};

	return {
		style,
		baseKeys: visualKeys,
		allKeys,
		interactionAllowedKeys: interactionAllowedKeys as Allowed,
		types: {
			VisualStyle: null! as VisualStyle,
			InteractionEnabledStyle: null! as InteractionEnabledStyle,
			Props: null! as Props,
		},
	};
}
