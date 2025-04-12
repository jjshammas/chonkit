export const CSS_VARIABLE_PREFIX = "--ck-";
export const convertJSVariableNameToCSSVariableName = (
	variableName: string
): string => {
	// Convert camelCase to kebab-case
	return (
		CSS_VARIABLE_PREFIX +
		variableName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
	);
};
