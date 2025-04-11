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
	rootAncestor: React.RefObject<HTMLElement | null>
): GeometryObserver {
	const subscribers = useRef<Set<GeometryCallback>>(new Set());

	const notify = () => {
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
	};

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new ResizeObserver(notify);
		observer.observe(el);

		return () => observer.disconnect();
	}, [ref]);

	const subscribe = (
		cb: GeometryCallback,
		opts?: { immediate?: boolean }
	) => {
		subscribers.current.add(cb);

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
		};
	};

	return { subscribe };
}
