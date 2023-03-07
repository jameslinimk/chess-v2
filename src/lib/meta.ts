import type { MetaTagsProps } from "svelte-meta-tags"

/// Returns the meta tags for a page given its title, description, and path
export const tags = (title: string, description: string, path: string, extra: MetaTagsProps = {}): MetaTagsProps => {
	const template = "%s • ChessV2"
	const href = new URL(path, "https://chessv2.jamesalin.com").href

	return {
		title,
		titleTemplate: template,
		description,
		canonical: href,
		openGraph: {
			title: template.replaceAll("%s", title),
			site_name: "ChessV2",
			description,
			url: href,
			type: "website",
		},
		...extra,
	}
}
