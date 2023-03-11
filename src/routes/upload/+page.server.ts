import { fail } from "@sveltejs/kit"
import { node, type Tensor3D } from "@tensorflow/tfjs-node"
import { randomUUID } from "crypto"
import { writeFile } from "fs/promises"
import { load } from "nsfwjs"
import type { Actions } from "./$types"
import { avatarMaxSize, imageTypes, threshold } from "./config"

const model = await load()

export const actions: Actions = {
	upload: async ({ request }) => {
		const data = await request.formData()
		const image = data.get("image")

		if (!image || !(image instanceof File)) {
			return fail(400, { invalid: true })
		}

		if (image.size > avatarMaxSize) {
			return fail(400, { size: true })
		}

		if (imageTypes.includes(image.type) === false) {
			return fail(400, { type: true })
		}

		const aBuffer = await image.arrayBuffer()

		const img = node.decodeImage(new Uint8Array(aBuffer), 3) as Tensor3D
		const preds = await model.classify(img)
		img.dispose()

		if (preds.some((p) => ["Hentai", "Porn"].includes(p.className) && p.probability > threshold)) {
			return fail(400, { nsfw: true })
		}

		const suffix = image.type.replace("image/", ".")
		const uuid = randomUUID()

		await Promise.all([
			writeFile(`./static/avatars/${uuid}${suffix}`, Buffer.from(aBuffer)),
			writeFile(
				`./static/avatars/${uuid}.info.json`,
				JSON.stringify({
					originalName: image.name,
					type: image.type,
					size: image.size,
					predictions: preds,
				})
			),
		])

		return { path: uuid + suffix }
	},
}
