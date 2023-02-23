export class ValueSet<T> {
	private set: Set<string>

	constructor() {
		this.set = new Set()
	}

	add(value: T) {
		if (typeof value === "object" && value !== null) {
			// For objects and arrays, stringify them and add the resulting string
			this.set.add(JSON.stringify(value))
		} else {
			// For non-object values, just add them directly
			this.set.add(String(value))
		}
	}

	delete(value: T) {
		if (typeof value === "object" && value !== null) {
			// For objects and arrays, stringify them and delete the resulting string
			return this.set.delete(JSON.stringify(value))
		} else {
			// For non-object values, just delete them directly
			return this.set.delete(String(value))
		}
	}

	has(value: T) {
		if (typeof value === "object" && value !== null) {
			// For objects and arrays, stringify them and check if the resulting string is in the set
			return this.set.has(JSON.stringify(value))
		} else {
			// For non-object values, just check if they are in the set directly
			return this.set.has(String(value))
		}
	}

	clear() {
		this.set.clear()
	}

	get size() {
		return this.set.size
	}

	*[Symbol.iterator]() {
		// Iterate over the parsed values of the JSON strings in the set
		yield* this.values()
	}

	*values() {
		for (const str of this.set) {
			try {
				// Attempt to parse the JSON string, and yield the resulting object or value
				yield JSON.parse(str) as T
			} catch {
				// If parsing fails, just yield the string itself
				yield str as unknown as T
			}
		}
	}
}
