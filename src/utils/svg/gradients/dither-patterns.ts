// prettier-ignore
const patterns = [

`
01
10
`,

`
0001
0100
1010
1101
`,
`
0001
0000
0000
0100
0101
0001
0101
1101
0111
`,

`
1000
0010
1000
1000
0000
0010
0010
0010
0101
0101
1010
0101
1010
0101
1010
0101
1010
1010
1101
1101
1101
1111
1111
1111
1111
1101
1111
0111
`


];

export default patterns.map((pattern) => {
	return pattern.split("\n").filter((line) => line);
});
