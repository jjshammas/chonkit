export function svgToDataURL(svgElement: SVGElement): string {
	if (!(svgElement instanceof SVGElement)) {
		throw new Error("Input must be an SVGElement.");
	}

	// Ensure xmlns is present
	if (!svgElement.hasAttribute("xmlns")) {
		svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	}

	const svgString = new XMLSerializer().serializeToString(svgElement);

	// Encode special characters for use in a URL
	const encoded = encodeURIComponent(svgString)
		.replace(/'/g, "%27")
		.replace(/"/g, "%22");

	return `data:image/svg+xml,${encoded}`;
}
