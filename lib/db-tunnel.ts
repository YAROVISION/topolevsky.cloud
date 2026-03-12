import { spawn } from 'child_process'
import net from 'net'

const DB_PORT = 3307
const DB_HOST = '127.0.0.1'

let tunnelProcess: ReturnType<typeof spawn> | null = null
let tunnelReady = false
let ensurePromise: Promise<void> | null = null

function checkPort(): Promise<boolean> {
	return new Promise(resolve => {
		const socket = new net.Socket()
		socket.setTimeout(1000)
		socket.on('connect', () => {
			socket.destroy()
			resolve(true)
		})
		socket.on('error', () => resolve(false))
		socket.on('timeout', () => {
			socket.destroy()
			resolve(false)
		})
		socket.connect(DB_PORT, DB_HOST)
	})
}

async function waitForPort(maxWaitMs = 20000): Promise<boolean> {
	const start = Date.now()
	while (Date.now() - start < maxWaitMs) {
		if (await checkPort()) return true
		await new Promise(r => setTimeout(r, 800))
	}
	return false
}

function spawnTunnel(): void {
	if (tunnelProcess) return

	const { SSH_PASS, SSH_USER, SSH_HOST } = process.env
	if (!SSH_PASS || !SSH_USER || !SSH_HOST) {
		throw new Error('Missing SSH env vars (SSH_PASS, SSH_USER, SSH_HOST)')
	}

	console.log('[db-tunnel] Starting SSH tunnel...')

	tunnelProcess = spawn(
		'sshpass',
		[
			'-p', SSH_PASS,
			'ssh',
			'-o', 'StrictHostKeyChecking=no',
			'-o', 'ServerAliveInterval=30',
			'-p', '65002',
			'-N',
			'-L', `${DB_HOST}:${DB_PORT}:127.0.0.1:3306`,
			`${SSH_USER}@${SSH_HOST}`
		],
		{ stdio: 'ignore', detached: false }
	)

	tunnelProcess.on('exit', (code) => {
		console.log(`[db-tunnel] Process exited with code ${code}`)
		tunnelProcess = null
		tunnelReady = false
		ensurePromise = null
	})

	tunnelProcess.on('error', (err) => {
		console.error('[db-tunnel] Failed to spawn tunnel:', err)
		tunnelProcess = null
		tunnelReady = false
		ensurePromise = null
	})
}

export async function ensureTunnel(): Promise<void> {
	if (process.env.NODE_ENV === 'production') {
		return
	}
	// Already verified ready and port is up
	if (tunnelReady) {
		const up = await checkPort()
		if (up) return
		// Port dropped — reset and retry
		tunnelReady = false
		tunnelProcess = null
		ensurePromise = null
	}

	// Deduplicate concurrent calls
	if (ensurePromise) return ensurePromise

	ensurePromise = (async () => {
		// Maybe externally started tunnel
		if (await checkPort()) {
			tunnelReady = true
			return
		}

		spawnTunnel()

		const ready = await waitForPort(20000)
		if (!ready) {
			throw new Error('SSH tunnel could not be established within 20 seconds')
		}

		tunnelReady = true
		console.log('[db-tunnel] Tunnel is ready on port', DB_PORT)
	})()

	return ensurePromise
}
