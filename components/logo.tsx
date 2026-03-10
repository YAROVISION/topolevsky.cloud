export function Logo() {
	return (
		<a
			href="/"
			className="flex items-center gap-2"
		>
			<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
				<span className="text-zinc-950 font-bold text-sm">L</span>
			</div>
			<span className="font-semibold text-white hidden sm:block">Lexis</span>
		</a>
	)
}
