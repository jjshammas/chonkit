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
	const { rootAncestor } = useChonkit();
	const observerRef = useRef<ResizeObserver | null>(null);
	const observedElRef = useRef<HTMLElement | null>(null);
	const rafIdRef = useRef<number | null>(null);

	const notify = () => {
		if (rafIdRef.current != null) return;
		rafIdRef.current = requestAnimationFrame(() => {
			rafIdRef.current = null;

			const el = ref.current;
			const root = rootAncestor.current;
			if (!el || !root) return;

			const box = el.getBoundingClientRect();
			const rootBox = root.getBoundingClientRect();

			const geometry = {
				width: box.width,
				height: box.height,
				x: box.left - rootBox.left,
				y: box.top - rootBox.top,
			};

			subscribers.current.forEach((cb) => cb(geometry));
		});
	};

	const ensureObservation = () => {
		const el = ref.current;
		if (!el || subscribers.current.size === 0) return;

		// Create observer lazily on first subscriber
		if (!observerRef.current) {
			observerRef.current = new ResizeObserver(() => notify());
		}

		// Observe current element or switch if element changed
		if (observedElRef.current !== el) {
			if (observedElRef.current) {
				observerRef.current!.unobserve(observedElRef.current);
			}
			observerRef.current.observe(el);
			observedElRef.current = el;
		}
	};

	// If the element changes and we already have subscribers, update observation
	useEffect(() => {
		ensureObservation();
	}, [ref.current]);

	// Cleanup on unmount: disconnect observer and cancel any pending rAF
	useEffect(() => {
		return () => {
			if (rafIdRef.current != null) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = null;
			}
			if (observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
				observedElRef.current = null;
			}
		};
	}, []);

	const subscribe = (
		cb: GeometryCallback,
		opts?: { immediate?: boolean }
	) => {
		subscribers.current.add(cb);

		// Lazily create/attach the observer on first subscriber
		ensureObservation();

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
			// If no subscribers remain, disconnect observer
			if (subscribers.current.size === 0 && observerRef.current) {
				observerRef.current.disconnect();
				observerRef.current = null;
				observedElRef.current = null;
			}
		};
	};

	return { subscribe };
}
