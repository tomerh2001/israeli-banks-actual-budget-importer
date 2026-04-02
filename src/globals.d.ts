declare module '*.json' {
	const value: any;
	export default value;
}

declare module 'mute-stdout' {
	const stdout: {
		mute: () => void;
		unmute: () => void;
	};

	export default stdout;
}
