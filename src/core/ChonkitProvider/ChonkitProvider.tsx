import themes, {
	createCSSVariables,
	mergeThemes,
	Theme,
	ThemePartial,
} from "@/core/themes";
import clsx from "clsx";
import React, {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";

const DEFAULT_BLOCK_SIZE = 2;
const DEFAULT_STEP_RATE_HZ = 24;

interface ChonkitContextValue {
	blockSize: number;
	rootAncestor: React.RefObject<HTMLDivElement | null>;
	theme: Theme;
	viewportWidth: number;
	stepRateHz?: number;
	geometryObserver: {
		subscribe: (
			element: HTMLElement,
			cb: (geometry: {
				width: number;
				height: number;
				x: number;
				y: number;
			}) => void,
			opts?: { immediate?: boolean }
		) => () => void;
	};
}

const ChonkitContext = createContext<ChonkitContextValue | undefined>(
	undefined
);

export interface ChonkitProviderProps
	extends React.HTMLAttributes<HTMLDivElement> {
	children: ReactNode;
	blockSize: number;
	showGrid?: boolean;
	theme?: Theme | ThemePartial | keyof typeof themes;
	stepRateHz?: number;
}

const Grid = ({ blockSize }: { blockSize: number }) => {
	return (
		<div
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				background: `repeating-conic-gradient(rgba(0,0,0,0.1) 0% 25%, transparent 0% 50%) 50% / 20px 20px`,
				backgroundPosition: "0 0",
				backgroundSize: `${blockSize * 2}px ${blockSize * 2}px`,
				zIndex: 1000,
			}}
		/>
	);
};

export const ChonkitProvider: React.FC<ChonkitProviderProps> = ({
	children,
	blockSize = DEFAULT_BLOCK_SIZE,
	showGrid,
	style,
	theme: rawTheme,
	stepRateHz = DEFAULT_STEP_RATE_HZ,
	...rest
}) => {
	const rootAncestor = useRef<HTMLDivElement>(null);

	// Shared ResizeObserver and subscriber registry for all elements
	const roRef = useRef<ResizeObserver | null>(null);
	const subscribersByEl = useRef<
		Map<
			HTMLElement,
			Set<
				(g: {
					width: number;
					height: number;
					x: number;
					y: number;
				}) => void
			>
		>
	>(new Map());
	const dirtyTargets = useRef<Set<HTMLElement>>(new Set());
	const rafIdRef = useRef<number | null>(null);

	// Queue to batch-removal of placeholder classes to avoid synchronous chains
	const pendingUnknownRemovals = useRef<Set<HTMLElement>>(new Set());
	const unknownRemoved = useRef<WeakSet<HTMLElement>>(new WeakSet());
	const unknownRafIdRef = useRef<number | null>(null);

	// Queue for batching subscription geometry reads via rAF
	const pendingSubscriptionReads = useRef<
		Array<{
			el: HTMLElement;
			cb: (g: {
				width: number;
				height: number;
				x: number;
				y: number;
			}) => void;
		}>
	>([]);
	const subscriptionReadRafRef = useRef<number | null>(null);

	// Track elements we've ever observed, to distinguish first observation from re-subscriptions
	const elementsEverObserved = useRef<WeakSet<HTMLElement>>(new WeakSet());

	const scheduleUnknownRemovals = () => {
		if (unknownRafIdRef.current != null) return;
		unknownRafIdRef.current = requestAnimationFrame(() => {
			unknownRafIdRef.current = null;
			const start = performance.now();
			const budgetMs = 3; // limit work per frame to keep FPS smooth
			let processed = 0;
			const batch = Array.from(pendingUnknownRemovals.current);
			for (const el of batch) {
				pendingUnknownRemovals.current.delete(el);
				if (unknownRemoved.current.has(el)) continue;
				el.classList.remove("geometry-unknown");
				el.classList.remove("geometry-unknown-show");
				unknownRemoved.current.add(el);
				processed++;
				if (performance.now() - start > budgetMs) break;
			}
			// If work remains, schedule next frame
			if (pendingUnknownRemovals.current.size > 0) {
				scheduleUnknownRemovals();
			}
		});
	};

	const scheduleSubscriptionReads = () => {
		if (subscriptionReadRafRef.current != null) return;
		subscriptionReadRafRef.current = requestAnimationFrame(() => {
			subscriptionReadRafRef.current = null;
			const root = rootAncestor.current;
			if (!root) {
				pendingSubscriptionReads.current = [];
				return;
			}
			const rootBox = root.getBoundingClientRect();
			const reads = pendingSubscriptionReads.current;
			pendingSubscriptionReads.current = [];
			for (const { el, cb } of reads) {
				const box = el.getBoundingClientRect();
				cb({
					width: box.width,
					height: box.height,
					x: box.left - rootBox.left,
					y: box.top - rootBox.top,
				});
			}
		});
	};

	const scheduleBroadcast = () => {
		if (rafIdRef.current != null) return;
		rafIdRef.current = requestAnimationFrame(() => {
			rafIdRef.current = null;
			const root = rootAncestor.current;
			if (!root) {
				dirtyTargets.current.clear();
				return;
			}
			const rootBox = root.getBoundingClientRect();
			const targets = Array.from(dirtyTargets.current);
			dirtyTargets.current.clear();
			for (const el of targets) {
				const subs = subscribersByEl.current.get(el);
				if (!subs || subs.size === 0) continue;
				const box = el.getBoundingClientRect();
				const geometry = {
					width: box.width,
					height: box.height,
					x: box.left - rootBox.left,
					y: box.top - rootBox.top,
				};
				for (const cb of subs) cb(geometry);
				// Batch-clear placeholder classes; only once per element
				if (
					(el.classList.contains("geometry-unknown") ||
						el.classList.contains("geometry-unknown-show")) &&
					!unknownRemoved.current.has(el)
				) {
					pendingUnknownRemovals.current.add(el);
				}
			}
			scheduleUnknownRemovals();
		});
	};

	const ensureRO = () => {
		if (!roRef.current) {
			roRef.current = new ResizeObserver((entries) => {
				for (const entry of entries) {
					const el = entry.target as HTMLElement;
					if (subscribersByEl.current.has(el)) {
						dirtyTargets.current.add(el);
					}
				}
				scheduleBroadcast();
			});
		}
	};

	const geometrySubscribe = (
		element: HTMLElement,
		cb: (geometry: {
			width: number;
			height: number;
			x: number;
			y: number;
		}) => void,
		opts?: { immediate?: boolean }
	) => {
		ensureRO();
		const isInitialMount = !elementsEverObserved.current.has(element);
		elementsEverObserved.current.add(element);
		let set = subscribersByEl.current.get(element);
		if (!set) {
			set = new Set();
			subscribersByEl.current.set(element, set);
			roRef.current!.observe(element);
		}
		set.add(cb);

		// Queue geometry read for new subscription via batched rAF
		// If element is being observed for the first time, batch via RO (initial mount case)
		// If element was already observed before, deliver immediately (prop change case)
		const shouldQueue = opts?.immediate !== false && !isInitialMount;
		if (shouldQueue) {
			pendingSubscriptionReads.current.push({ el: element, cb });
			scheduleSubscriptionReads();
		}

		return () => {
			const s = subscribersByEl.current.get(element);
			if (!s) return;
			s.delete(cb);
			if (s.size === 0) {
				subscribersByEl.current.delete(element);
				try {
					roRef.current?.unobserve(element);
				} catch {}
				// Clear element from unknownRemoved set so that if new subscribers are added later,
				// the class removal logic will work again
				unknownRemoved.current.delete(element);
			}
		};
	};

	const geometryObserver = {
		subscribe: geometrySubscribe,
	};

	const [viewportWidth, setViewportWidth] = useState<number>(
		typeof window !== "undefined" ? window.innerWidth : 0
	);
	useEffect(() => {
		let raf = 0 as number | undefined;
		const onResize = () => {
			if (raf) cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				setViewportWidth(window.innerWidth);
			});
		};
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	const theme =
		typeof rawTheme === "string"
			? themes[rawTheme as keyof typeof themes]
			: typeof rawTheme === "object"
				? mergeThemes(themes.default, rawTheme)
				: themes.default;

	const addlStyle = {
		"--ck-block-size": `${blockSize}px`,
		...createCSSVariables(theme),
	} as React.CSSProperties;

	if (showGrid) {
		addlStyle.position = "relative";
	}

	return (
		<ChonkitContext.Provider
			value={{
				blockSize,
				rootAncestor: rootAncestor,
				theme,
				viewportWidth,
				stepRateHz,
				geometryObserver,
			}}
		>
			<div
				ref={rootAncestor}
				style={{
					...style,
					...addlStyle,
				}}
				className={clsx("chonkit-root", rest.className)}
				{...rest}
			>
				{children}
				{showGrid && <Grid blockSize={blockSize} />}
			</div>
		</ChonkitContext.Provider>
	);
};

export const useChonkit = (): ChonkitContextValue => {
	const context = useContext(ChonkitContext);
	if (!context) {
		throw new Error("useChonkit must be used within a ChonkitProvider");
	}
	return context;
};
