/**
 * A `key:value[:extra*]` tag.
 */
export class Tag {
  key: string;
  value: string;
  extra: string[];

  constructor(key: string, value: string, extra: string[]) {
    this.key = key;
    this.value = value;
    this.extra = extra;
  }

  /**
   * Custom toString implementation.
   * @returns a string in format `key:value[:extra*]`
   */
  toString() {
    let extras = "";
    this.extra.forEach((v) => {
      extras = `${extras}:${v}`;
    });

    return `${this.key}:${this.value}${extras}`;
  }

  /**
   * Parse a string into a tag.
   * 
   * @throws `InvalidTagError` if the input is not a valid tag
   */
  static parse(input: string) {
    const split = input.split(":", 3);
    if (split.length < 2) {
      throw new InvalidTagError(input);
    }

    const key = split[0];
    const value = split[1];
    let extra: string[];
    if (split.at(2) !== undefined) {
      extra = split[2].split(":");
    } else {
      extra = [];
    }

    return new Tag(key, value, extra);
  }

  /**
   * Check if the tag contains the specified `extraName`.
   */
  hasExtra(extraName: string) {
    return this.extra.includes(extraName);
  }

  /**
   * Check if this tag's `key` and `value` are equal to another tag.
   */
  equalsTag(other: Tag) {
    return this.key === other.key && this.value === other.value;
  }

  static default() {
    return new Tag("default", "default", []);
  }
}

export class InvalidTagError extends Error {
  constructor(invalidTag: string) {
    super(invalidTag);
  }
}
