import { useEffect, useRef } from "react";
import { useChonkit } from "@/core/ChonkitProvider/ChonkitProvider";

export type Geometry = { width: number; height: number; x: number; y: number };
export type GeometryCallback = (geometry: Geometry) => void;
export type GeometryObserver = {
	subscribe: (
		cb: GeometryCallback,
		opts?: { immediate?: boolean }
	) => () => void;
};

export function useGeometryObserver(
	ref: React.RefObject<HTMLElement | null>
): GeometryObserver {
	const subscribers = useRef<Set<GeometryCallback>>(new Set());
	const providerUnsubRef = useRef<(() => void) | null>(null);
	const currentElRef = useRef<HTMLElement | null>(null);
	const { geometryObserver, rootAncestor } = useChonkit();

	const providerCallback = (geometry: Geometry) => {
		subscribers.current.forEach((cb) => cb(geometry));
	};

	const ensureProviderSubscription = () => {
		const el = ref.current;
		if (!el || subscribers.current.size === 0) return;
		if (currentElRef.current === el && providerUnsubRef.current) return;

		// Resubscribe to provider if element changed
		if (providerUnsubRef.current) {
			providerUnsubRef.current();
			providerUnsubRef.current = null;
		}
		providerUnsubRef.current = geometryObserver.subscribe(
			el,
			providerCallback,
			{
				immediate: false,
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
		opts?: { immediate?: boolean }
	) => {
		subscribers.current.add(cb);

		// Lazily create/attach provider subscription on first subscriber
		ensureProviderSubscription();

		if (opts?.immediate !== false) {
			// 👇 Immediately notify with current geometry
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
			}
		}

		return () => {
			subscribers.current.delete(cb);
			// If no subscribers remain, unsubscribe from provider
			if (subscribers.current.size === 0 && providerUnsubRef.current) {
				providerUnsubRef.current();
				providerUnsubRef.current = null;
				currentElRef.current = null;
			}
		};
	};

	return { subscribe };
}
