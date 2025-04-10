import React from "react";
import styles from "./ExampleComponent.module.css";

function ExampleComponent({ title }: { title: string }) {
	return (
		<div>
			<h1 className={styles.title}>{title}</h1>
			<p>This is an example component.</p>
		</div>
	);
}

export default ExampleComponent;
