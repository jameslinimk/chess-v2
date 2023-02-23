/**
 * A set that can store any value, including objects and arrays
 */
export class ValueSet<T> {
	private set = new Set<string>()

	constructor(array?: T[]) {
		if (array !== undefined) {
			array.forEach((value) => this.add(value))
		}
	}

	/**
	 * Add a value to the set
	 */
	add(value: T) {
		if (typeof value === "object" && value !== null) {
			// For objects and arrays, stringify them and add the resulting string
			this.set.add(JSON.stringify(value))
		} else {
			// For non-object values, just add them directly
			this.set.add(String(value))
		}
	}

	/**
	 * Delete a value from the set
	 */
	delete(value: T) {
		if (typeof value === "object" && value !== null) {
			// For objects and arrays, stringify them and delete the resulting string
			return this.set.delete(JSON.stringify(value))
		} else {
			// For non-object values, just delete them directly
			return this.set.delete(String(value))
		}
	}

	/**
	 * Check if a value is in the set
	 */
	has(value: T) {
		if (typeof value === "object" && value !== null) {
			// For objects and arrays, stringify them and check if the resulting string is in the set
			return this.set.has(JSON.stringify(value))
		} else {
			// For non-object values, just check if they are in the set directly
			return this.set.has(String(value))
		}
	}

	/**
	 * Clear the set
	 */
	clear() {
		this.set.clear()
	}

	/**
	 * The number of values in the set
	 */
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
