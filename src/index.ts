import { parseFile } from "@parser/parser";
import { formatHtml, prefix, suffix } from "@formatter/format";

/**
 * @description The way the dates are formatted in the input file
 * @example
 * "DD/MM/YYYY",
 * "MM/D/YY"
 */
type DatePattern = string;

/**
 * @param filePath
 * @param datePattern The way the dates are formatted in the input file
 */
export function whatsappToHtml(
  filePath: string,
  title: string,
  datePattern: DatePattern,
  senderAliases?: { readonly [s: string]: string }
): string {
  try {
    const { messages, senders } = parseFile(filePath);

    return prefix(title) + formatHtml({
      datePattern: datePattern,
      messages: messages,
      senders,
      senderAliases,
    }) + suffix;
  } catch (error) {
    // tslint:disable-next-line:no-expression-statement
    console.error("Something went wrong: ", error.message);

    return "";
  }
}
