/**
 * Animation Manager: Singleton for managing keyframe injection, caching, and cleanup
 * Handles thousands of animated components efficiently by:
 * - Reusing identical keyframe animations via content hashing
 * - Tracking usage counts for cleanup
 * - Maintaining a dedicated stylesheet to avoid polluting others
 * - Deterministic naming based on animation content
 */

interface CachedKeyframe {
	name: string;
	hash: string;
	usageCount: number;
}

class AnimationManager {
	private stylesheet: CSSStyleSheet | null = null;
	private cache = new Map<string, CachedKeyframe>();
	private styleTag: HTMLStyleElement | null = null;

	constructor() {
		this.initializeStylesheet();
	}

	/**
	 * Create a dedicated stylesheet for animations on first use
	 */
	private initializeStylesheet() {
		if (typeof document === "undefined") return;

		const tag = document.createElement("style");
		tag.setAttribute("data-chonkit-animations", "true");
		document.head.appendChild(tag);
		this.styleTag = tag;
		this.stylesheet = tag.sheet as CSSStyleSheet;
	}

	/**
	 * Simple fast hash function for keyframe content
	 * Uses a simple string hash for deterministic naming
	 */
	private hashKeyframeContent(keyframeRules: string): string {
		let hash = 0;
		for (let i = 0; i < keyframeRules.length; i++) {
			const char = keyframeRules.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash).toString(36);
	}

	/**
	 * Cache keyframes by content hash. Returns the cached keyframe name.
	 * Multiple components with identical animations will reuse the same @keyframes rule.
	 */
	cacheKeyframes(keyframeRules: string): string {
		const hash = this.hashKeyframeContent(keyframeRules);

		// Check if already cached
		if (this.cache.has(hash)) {
			const cached = this.cache.get(hash)!;
			cached.usageCount++;
			return cached.name;
		}

		// Ensure stylesheet exists
		if (!this.stylesheet || !this.styleTag) {
			this.initializeStylesheet();
		}

		// Generate deterministic name from hash
		const keyframeName = `chonkit-anim-${hash}`;

		// Inject into stylesheet
		try {
			const rule = `@keyframes ${keyframeName} { ${keyframeRules} }`;
			this.stylesheet!.insertRule(rule, this.stylesheet!.cssRules.length);
		} catch (err) {
			console.error("Failed to insert keyframe rule", err, keyframeRules);
			return keyframeName; // Return name even if insertion failed, for consistency
		}

		// Cache it
		this.cache.set(hash, {
			name: keyframeName,
			hash,
			usageCount: 1,
		});

		return keyframeName;
	}

	/**
	 * Release a cached keyframe when component unmounts.
	 * When usage count reaches 0, removes the rule from the stylesheet.
	 */
	releaseKeyframes(keyframeRules: string): void {
		const hash = this.hashKeyframeContent(keyframeRules);
		const cached = this.cache.get(hash);

		if (!cached) {
			return; // Never was cached, nothing to do
		}

		cached.usageCount--;

		// Only clean up when usage drops to 0
		if (cached.usageCount <= 0) {
			this.removeKeyframeRule(cached.name);
			this.cache.delete(hash);
		}
	}

	/**
	 * Remove a keyframe rule from the stylesheet by name
	 */
	private removeKeyframeRule(keyframeName: string): void {
		if (!this.stylesheet) return;

		try {
			const rules = Array.from(this.stylesheet.cssRules);
			for (let i = 0; i < rules.length; i++) {
				const rule = rules[i];
				if (
					rule instanceof CSSKeyframesRule &&
					rule.name === keyframeName
				) {
					this.stylesheet.deleteRule(i);
					return;
				}
			}
		} catch (err) {
			console.error("Failed to remove keyframe rule", err);
		}
	}

	/**
	 * Get stats about cached keyframes (useful for debugging)
	 */
	getStats() {
		return {
			cachedCount: this.cache.size,
			totalUsage: Array.from(this.cache.values()).reduce(
				(sum, item) => sum + item.usageCount,
				0
			),
			details: Array.from(this.cache.values()).map((item) => ({
				name: item.name,
				usageCount: item.usageCount,
			})),
		};
	}

	/**
	 * Clear all cached keyframes and rules (mainly for testing)
	 */
	clear(): void {
		if (!this.stylesheet) return;

		try {
			while (this.stylesheet.cssRules.length > 0) {
				this.stylesheet.deleteRule(0);
			}
		} catch (err) {
			console.error("Failed to clear stylesheet", err);
		}

		this.cache.clear();
	}
}

// Create singleton instance
export const animationManager = new AnimationManager();

// Export type for reference
export type { CachedKeyframe };
