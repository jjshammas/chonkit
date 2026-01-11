// Cache Bayer matrices to avoid regenerating them
const bayerMatrixCache: Map<number, number[][]> = new Map();

/**
 * Generates a Bayer matrix of specified order (size = 2^order)
 * Used for ordered dithering in gradients. Results are cached.
 */
function generateBayerMatrix(order: number): number[][] {
	if (bayerMatrixCache.has(order)) {
		return bayerMatrixCache.get(order)!;
	}

	let matrix: number[][];

	if (order === 0) {
		matrix = [[0]];
	} else {
		const prevMatrix = generateBayerMatrix(order - 1);
		const size = prevMatrix.length;
		const newSize = size * 2;
		matrix = Array(newSize)
			.fill(null)
			.map(() => Array(newSize));

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				const val = prevMatrix[i][j];
				// Top-left quadrant
				matrix[i][j] = val * 4;
				// Top-right quadrant
				matrix[i][j + size] = val * 4 + 2;
				// Bottom-left quadrant
				matrix[i + size][j] = val * 4 + 3;
				// Bottom-right quadrant
				matrix[i + size][j + size] = val * 4 + 1;
			}
		}
	}

	bayerMatrixCache.set(order, matrix);
	return matrix;
}

/**
 * Converts a Bayer matrix to a dither pattern (2D number array for faster lookups)
 * The pattern is used to determine which cells should use the second color based on intensity
 */
function bayerMatrixToPattern(
	matrix: number[][],
	intensity: number
): number[][] {
	const threshold = (intensity / 255) * (matrix.length * matrix[0].length);
	const matrixSize = matrix.length;
	const pattern: number[][] = Array(matrixSize);

	for (let i = 0; i < matrixSize; i++) {
		const row = matrix[i];
		const patternRow = (pattern[i] = Array(matrixSize));
		for (let j = 0; j < matrixSize; j++) {
			patternRow[j] = row[j] < threshold ? 1 : 0;
		}
	}

	return pattern;
}

/**
 * Generates an optimal dither pattern for a given transition intensity
 * Uses Bayer matrix ordered dithering with a minimum of 8x8 for quality
 * Returns a 2D number array (0 or 1) for efficient lookups
 */
export function generateDitherPattern(
	width: number,
	height: number,
	intensity: number = 128
): number[][] {
	// Guard against invalid dimensions
	if (!Number.isFinite(width) || !Number.isFinite(height)) {
		return [];
	}

	const safeWidth = Math.max(1, Math.floor(width));
	const safeHeight = Math.max(1, Math.floor(height));

	// Always use at least 8x8 (order 3) for good dithering quality
	// Order 3 = 8x8, Order 4 = 16x16, etc.
	let order = 3;
	if (Math.max(safeWidth, safeHeight) >= 16) order = 4;
	if (Math.max(safeWidth, safeHeight) >= 32) order = 5;

	const bayerMatrix = generateBayerMatrix(order);
	const pattern = bayerMatrixToPattern(bayerMatrix, intensity);

	// Return tiled pattern as 2D number array
	const matrixSize = pattern.length;
	const tiledPattern: number[][] = Array(safeHeight);

	for (let row = 0; row < safeHeight; row++) {
		const matrixRow = pattern[row % matrixSize];
		const tiledRow = (tiledPattern[row] = Array(safeWidth));
		for (let col = 0; col < safeWidth; col++) {
			tiledRow[col] = matrixRow[col % matrixSize];
		}
	}

	return tiledPattern;
}

// Legacy export for backward compatibility if needed
export default {
	generateDitherPattern,
	generateBayerMatrix,
	bayerMatrixToPattern,
};
