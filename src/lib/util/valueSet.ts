/**
 * A set that can store any value, including objects and arrays
 */
export class ValueSet<T> {
	id = "valueSet"

	/**
	 * Check if a value is a `ValueSet`
	 */
	static isValueSet<T>(value: unknown): value is ValueSet<T> {
		return typeof value === "object" && value !== null && (value as ValueSet<T>)?.id === "valueSet"
	}

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
			this.set.add(JSON.stringify(value))
		} else {
			this.set.add(`${value}`)
		}
	}

	/**
	 * Add all values from another set to this set
	 */
	addSet(set: ValueSet<T>) {
		set.forEach((value) => this.add(value))
	}

	/**
	 * Delete a value from the set
	 */
	delete(value: T) {
		if (typeof value === "object" && value !== null) {
			return this.set.delete(JSON.stringify(value))
		}

		return this.set.delete(`${value}`)
	}

	/**
	 * Check if a value is in the set
	 */
	has(value: T) {
		if (typeof value === "object" && value !== null) {
			return this.set.has(JSON.stringify(value))
		}

		return this.set.has(`${value}`)
	}

	/**
	 * Clear the set
	 */
	clear() {
		this.set.clear()
	}

	/**
	 * Create a new set with the same values
	 */
	clone() {
		return new ValueSet(Array.from(this.values()))
	}

	/**
	 * The number of values in the set
	 */
	get size() {
		return this.set.size
	}

	*[Symbol.iterator]() {
		yield* this.values()
	}

	*values() {
		for (const str of this.set) {
			try {
				yield JSON.parse(str) as T
			} catch {
				yield str as T
			}
		}
	}

	/**
	 * Iterate over the values in the set
	 */
	forEach(callbackfn: (value: T, value2: T, set: ValueSet<T>) => void, thisArg?: any) {
		for (const value of this.values()) {
			callbackfn.call(thisArg, value, value, this)
		}
	}
}
