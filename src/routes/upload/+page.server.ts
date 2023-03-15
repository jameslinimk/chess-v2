import { fail } from "@sveltejs/kit"
import { node, type Tensor3D } from "@tensorflow/tfjs-node"
import { randomUUID } from "crypto"
import { writeFile } from "fs/promises"
import { load } from "nsfwjs"
import type { NSFW_CLASSES } from "nsfwjs/dist/nsfw_classes"
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
		const preds = (await model.classify(img)).reduce((acc, cur) => {
			acc[cur.className] = cur.probability
			return acc
		}, {} as Record<(typeof NSFW_CLASSES)[keyof typeof NSFW_CLASSES], number>)
		img.dispose()

		if (Math.max(preds.Hentai, preds.Porn) > threshold) {
			return fail(400, { nsfw: true })
		}

		const suffix = image.type.replace("image/", ".")
		const uuid = randomUUID()
		const fullUuid = uuid + suffix

		await Promise.all([
			writeFile(`./static/avatars/${fullUuid}`, Buffer.from(aBuffer)),
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

		return { path: fullUuid }
	},
}
