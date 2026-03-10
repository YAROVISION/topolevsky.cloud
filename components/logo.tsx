export function Logo() {
	return (
		<a
			href="/"
			className="flex items-center gap-2"
		>
			<svg
				viewBox="0 0 480 160"
				className="h-8 w-auto"
				xmlns="http://www.w3.org/2000/svg"
			>
				<defs>
					<linearGradient
						id="accentGrad"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop
							offset="0%"
							style={{ stopColor: '#1A6BFF', stopOpacity: 1 }}
						/>
						<stop
							offset="100%"
							style={{ stopColor: '#00C2A8', stopOpacity: 1 }}
						/>
					</linearGradient>
					<linearGradient
						id="nodeGrad"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop
							offset="0%"
							style={{ stopColor: '#1A6BFF', stopOpacity: 1 }}
						/>
						<stop
							offset="100%"
							style={{ stopColor: '#00C2A8', stopOpacity: 1 }}
						/>
					</linearGradient>
					<filter id="glow">
						<feGaussianBlur
							stdDeviation="2.5"
							result="coloredBlur"
						/>
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Background - removed for transparent navbar */}

				{/* Subtle grid pattern - removed for simplicity in UI */}

				{/* === ICON: Logic graph / text analysis symbol === */}
				<g
					filter="url(#glow)"
					opacity="0.7"
				>
					<line
						x1="62"
						y1="80"
						x2="38"
						y2="56"
						stroke="url(#accentGrad)"
						strokeWidth="1.5"
					/>
					<line
						x1="62"
						y1="80"
						x2="88"
						y2="56"
						stroke="url(#accentGrad)"
						strokeWidth="1.5"
					/>
					<line
						x1="62"
						y1="80"
						x2="62"
						y2="108"
						stroke="url(#accentGrad)"
						strokeWidth="1.5"
					/>
					<line
						x1="38"
						y1="56"
						x2="24"
						y2="36"
						stroke="#1A6BFF"
						strokeWidth="1.2"
						opacity="0.6"
					/>
					<line
						x1="38"
						y1="56"
						x2="48"
						y2="34"
						stroke="#1A6BFF"
						strokeWidth="1.2"
						opacity="0.6"
					/>
					<line
						x1="88"
						y1="56"
						x2="78"
						y2="34"
						stroke="#00C2A8"
						strokeWidth="1.2"
						opacity="0.6"
					/>
					<line
						x1="88"
						y1="56"
						x2="100"
						y2="36"
						stroke="#00C2A8"
						strokeWidth="1.2"
						opacity="0.6"
					/>
					<line
						x1="62"
						y1="108"
						x2="46"
						y2="128"
						stroke="#1A6BFF"
						strokeWidth="1.2"
						opacity="0.6"
					/>
					<line
						x1="62"
						y1="108"
						x2="78"
						y2="128"
						stroke="#00C2A8"
						strokeWidth="1.2"
						opacity="0.6"
					/>
				</g>

				<g filter="url(#glow)">
					<circle
						cx="24"
						cy="36"
						r="4"
						fill="none"
						stroke="#1A6BFF"
						strokeWidth="1.5"
						opacity="0.7"
					/>
					<circle
						cx="48"
						cy="34"
						r="4"
						fill="none"
						stroke="#1A6BFF"
						strokeWidth="1.5"
						opacity="0.7"
					/>
					<circle
						cx="78"
						cy="34"
						r="4"
						fill="none"
						stroke="#00C2A8"
						strokeWidth="1.5"
						opacity="0.7"
					/>
					<circle
						cx="100"
						cy="36"
						r="4"
						fill="none"
						stroke="#00C2A8"
						strokeWidth="1.5"
						opacity="0.7"
					/>
					<circle
						cx="46"
						cy="128"
						r="4"
						fill="none"
						stroke="#1A6BFF"
						strokeWidth="1.5"
						opacity="0.7"
					/>
					<circle
						cx="78"
						cy="128"
						r="4"
						fill="none"
						stroke="#00C2A8"
						strokeWidth="1.5"
						opacity="0.7"
					/>
				</g>

				<g filter="url(#glow)">
					<circle
						cx="38"
						cy="56"
						r="6"
						fill="currentColor"
						stroke="#1A6BFF"
						strokeWidth="2"
					/>
					<circle
						cx="88"
						cy="56"
						r="6"
						fill="currentColor"
						stroke="#00C2A8"
						strokeWidth="2"
					/>
					<circle
						cx="62"
						cy="108"
						r="6"
						fill="currentColor"
						stroke="url(#accentGrad)"
						strokeWidth="2"
					/>
				</g>

				<circle
					cx="62"
					cy="80"
					r="10"
					fill="url(#nodeGrad)"
					filter="url(#glow)"
				/>
				<circle
					cx="62"
					cy="80"
					r="10"
					fill="none"
					stroke="white"
					strokeWidth="1"
					opacity="0.3"
				/>
				<text
					x="62"
					y="84.5"
					textAnchor="middle"
					fontFamily="Georgia, serif"
					fontSize="10"
					fontWeight="bold"
					fill="white"
				>
					λ
				</text>

				{/* === WORDMARK: LEXIS === */}
				<text
					x="138"
					y="100"
					fontFamily="'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif"
					fontSize="58"
					fontWeight="700"
					letterSpacing="-1"
					fill="white"
				>
					LEXIS
				</text>

				{/* Gradient underline accent */}
				<rect
					x="138"
					y="108"
					width="260"
					height="2.5"
					rx="1.25"
					fill="url(#accentGrad)"
					opacity="0.9"
				/>

				{/* Tagline */}
				<text
					x="138"
					y="130"
					fontFamily="'Courier New', Courier, monospace"
					fontSize="11"
					letterSpacing="3.5"
					fill="#4A90D9"
					opacity="0.8"
				>
					LOGICAL TEXT ANALYSIS
				</text>
			</svg>
		</a>
	)
}
