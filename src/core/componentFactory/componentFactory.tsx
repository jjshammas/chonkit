import { createComponentVisualTypes } from "@/core/themes/createComponentVisualTypes";
import { createComponentVariantThemeTypes } from "@/core/themes/createComponentThemeTypes";
import { WithoutInteractionStates } from "@/core/themes";
import React, {
	FC,
	ReactNode,
	ElementType,
	createElement,
	forwardRef,
} from "react";
import { useComponentTheme } from "@/hooks/useComponentTheme";

// Base component type definition
export type ChonkitComponent<
	FinalProps,
	Style = unknown,
	ThemeConfig = unknown
> = FC<FinalProps> & {
	displayName?: string;
	visualStyle?: Style;
	interactionAllowedKeys?: readonly string[];
	types: {
		Props: FinalProps;
		Theme?: ThemeConfig;
		VisualStyle?: any;
		VisualProps?: any;
		ThemeProps?: any;
	};
};

export const componentFactory = <
	ExtendedComponent extends ChonkitComponent<any, any, any> | undefined,
	TExtraProps extends Record<string, any> = {},
	TVisualStyle extends Record<string, any> = {},
	TPolymorphic extends boolean = false
>({
	supports,
	extends: Extended,
	visualStyle,
	theme: additionalTheme,
	extraProps = {} as TExtraProps,
	name,
}: {
	supports: {
		theme?: boolean;
		variants?: boolean;
		visualStyle?: boolean;
		polymorphic?: TPolymorphic;
	};
	extends?: ExtendedComponent;
	visualStyle?: {
		style: TVisualStyle;
		interactionAllowedKeys: readonly (keyof TVisualStyle & string)[];
	};
	theme?: any;
	extraProps?: TExtraProps;
	name?: string;
}) => {
	type BaseExtendedProps = ExtendedComponent extends ChonkitComponent<
		infer P,
		any,
		any
	>
		? P
		: {};

	type InheritedStyle = ExtendedComponent extends {
		visualStyle: { style: infer S };
	}
		? S
		: {};

	type FinalVisualStyle = keyof TVisualStyle extends never
		? InheritedStyle
		: TVisualStyle;

	type FinalProps = InferredProps<
		BaseExtendedProps,
		TExtraProps,
		FinalVisualStyle,
		TPolymorphic
	>;

	const visual =
		supports.visualStyle && visualStyle
			? createComponentVisualTypes({
					style: visualStyle.style,
					interactionAllowedKeys: visualStyle.interactionAllowedKeys,
			  })
			: undefined;

	const theme =
		supports.theme && visual
			? createComponentVariantThemeTypes({
					base: visual.types.VisualStyle,
					interactionAllowedKeys: visual.interactionAllowedKeys,
					...additionalTheme,
			  })
			: undefined;

	const Component = Object.assign(
		forwardRef((props: any, ref: any) => {
			const { as, ...rest } = props;
			const finalProps = useComponentTheme(
				name ?? ("UnnamedComponent" as any),
				rest
			);
			const Comp = as || Extended || "div";
			return createElement(Comp, { ...finalProps, ref });
		}),
		{
			displayName: name ?? "UnnamedComponent",
			visualStyle: visual,
			interactionAllowedKeys: visual?.interactionAllowedKeys,
			types: {
				Props: null as unknown as FinalProps,
				VisualStyle: visual?.types.VisualStyle,
				VisualProps: visual?.types.Props,
				Theme: theme?.types.Theme,
				ThemeProps: theme?.types.Props,
			},
		}
	) as ChonkitComponent<FinalProps, typeof visual, typeof theme>;

	return Component;
};

// Inferred helpers
type InferredProps<
	BaseProps,
	Extra extends Record<string, any>,
	Style extends Record<string, any>,
	Poly extends boolean
> = Omit<WithoutInteractionStates<BaseProps>, "as"> &
	(Poly extends true ? { as?: ElementType } : {}) &
	Extra &
	(Style extends Record<string, any>
		? ReturnType<
				typeof createComponentVisualTypes<
					Style,
					readonly (keyof Style & string)[]
				>
		  >["types"]["Props"]
		: {});

// Optional — keep for chaining visual/theme types later
type InferredStyle<Ext> = Ext extends { visualStyle: infer S } ? S : {};

type InferredTheme<Ext> = Ext extends { interactionAllowedKeys: any }
	? ReturnType<typeof createComponentVariantThemeTypes>
	: undefined;

// ✅ Test component usage
const TestBase = componentFactory({
	supports: {
		theme: true,
		variants: true,
		visualStyle: true,
		polymorphic: true,
	},
	extraProps: {
		children: undefined as ReactNode,
		foo: undefined as string | undefined,
	},
	visualStyle: {
		style: {
			backgroundColor: undefined as string | undefined,
		},
		interactionAllowedKeys: ["backgroundColor"] as const,
	},
	name: "TestBase",
});

const TestExtends = componentFactory({
	supports: {
		theme: true,
		variants: true,
		visualStyle: true,
		polymorphic: true,
	},
	extraProps: {
		baz: undefined as number | undefined,
	},
	extends: TestBase,
	name: "TestExtends",
});

const render = () => {
	return (
		<>
			<TestBase foo="123" backgroundColor="red">
				hi
			</TestBase>
			<TestExtends foo="ok" baz={12} />
		</>
	);
};
