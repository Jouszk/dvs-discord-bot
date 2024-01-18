export default class StringUtils {
  public static smartTrim(
    str: string,
    maxLength: number,
    suffix = "..."
  ): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length + 1).trimEnd() + suffix;
  }
}
