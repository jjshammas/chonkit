import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";
import { useEffect, useRef } from "react";

export type Geometry = { width: number; height: number; x: number; y: number };
export type GeometryCallback = (geometry: Geometry) => void;
export type GeometryObserver = {
	subscribe: (
		cb: GeometryCallback,
		opts?: { immediate?: boolean }
	) => () => void;
};

export function useGeometryObserver(
	ref: React.RefObject<HTMLElement | null>,
	opts?: { immediateGeometry?: boolean }
): GeometryObserver {
	const subscribers = useRef<Set<GeometryCallback>>(new Set());
	const providerUnsubRef = useRef<(() => void) | null>(null);
	const currentElRef = useRef<HTMLElement | null>(null);
	const firstNotificationRef = useRef<boolean>(true);
	const lastGeometryRef = useRef<Geometry | null>(null);
	const pendingCachedRafRef = useRef<Map<GeometryCallback, number>>(
		new Map()
	);
	const { geometryObserver, rootAncestor } = useChonkit();

	const providerCallback = (geometry: Geometry) => {
		// Mark that first geometry has been delivered; provider handles batched class removal
		if (firstNotificationRef.current) {
			firstNotificationRef.current = false;
		}
		lastGeometryRef.current = geometry;
		subscribers.current.forEach((cb) => cb(geometry));
	};

	const ensureProviderSubscription = () => {
		const el = ref.current;
		if (!el || subscribers.current.size === 0) return;
		if (currentElRef.current === el && providerUnsubRef.current) return;

		// Resubscribe to provider if element changed
		if (currentElRef.current && currentElRef.current !== el) {
			lastGeometryRef.current = null;
		}
		if (providerUnsubRef.current) {
			providerUnsubRef.current();
			providerUnsubRef.current = null;
		}
		providerUnsubRef.current = geometryObserver.subscribe(
			el,
			providerCallback,
			{
				immediate: false, // Provider batches all reads via ResizeObserver
			}
		);
		currentElRef.current = el;
	};

	// If the element changes and we already have subscribers, update provider subscription
	useEffect(() => {
		ensureProviderSubscription();
	}, [ref.current]);

	// Cleanup on unmount: unsubscribe provider
	useEffect(() => {
		return () => {
			if (providerUnsubRef.current) {
				providerUnsubRef.current();
				providerUnsubRef.current = null;
			}
			currentElRef.current = null;
		};
	}, []);

	const subscribe = (
		cb: GeometryCallback,
		subscribeOpts?: { immediate?: boolean }
	) => {
		subscribers.current.add(cb);

		// Ensure provider subscription is set up
		ensureProviderSubscription();

		// If immediateGeometry is enabled at hook level, read synchronously on first subscription
		let deliveredImmediate = false;
		if (subscribeOpts?.immediate !== false && opts?.immediateGeometry) {
			const el = ref.current;
			const root = rootAncestor.current;
			if (el && root) {
				const box = el.getBoundingClientRect();
				const rootBox = root.getBoundingClientRect();
				cb({
					width: box.width,
					height: box.height,
					x: box.left - rootBox.left,
					y: box.top - rootBox.top,
				});
				deliveredImmediate = true;
			}
		}
		if (
			subscribeOpts?.immediate !== false &&
			!deliveredImmediate &&
			lastGeometryRef.current
		) {
			const rafId = requestAnimationFrame(() => {
				pendingCachedRafRef.current.delete(cb);
				if (!subscribers.current.has(cb) || !lastGeometryRef.current)
					return;
				cb(lastGeometryRef.current);
			});
			pendingCachedRafRef.current.set(cb, rafId);
		}

		return () => {
			subscribers.current.delete(cb);
			const pendingRaf = pendingCachedRafRef.current.get(cb);
			if (pendingRaf != null) {
				cancelAnimationFrame(pendingRaf);
				pendingCachedRafRef.current.delete(cb);
			}
			// If no subscribers remain, unsubscribe from provider
			if (subscribers.current.size === 0 && providerUnsubRef.current) {
				providerUnsubRef.current();
				providerUnsubRef.current = null;
				currentElRef.current = null;
				lastGeometryRef.current = null;
			}
		};
	};

	return { subscribe };
}
