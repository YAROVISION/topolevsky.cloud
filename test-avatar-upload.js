// Node test script to POST a tiny PNG to the test upload route
// Usage: node test-avatar-upload.js

const pngBase64 =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AABQUBAcqk2j4AAAAASUVORK5CYII=' // 1x1 PNG

async function run() {
	const buffer = Buffer.from(pngBase64, 'base64')
	const blob = new Blob([buffer], { type: 'image/png' })
	const form = new FormData()
	form.append('avatar', blob, 'tiny.png')

	const res = await fetch('http://localhost:3000/api/test-avatar-upload', {
		method: 'POST',
		body: form
	})
	const json = await res.json()
	console.log('Status:', res.status)
	console.log(json)
}

run().catch(err => {
	console.error(err)
	process.exit(1)
})
