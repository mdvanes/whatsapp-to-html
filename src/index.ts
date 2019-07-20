import { parseFile } from "@parser/parser";
import { formatHtml } from "@formatter/format";

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
  datePattern: DatePattern,
  senderAliases?: { readonly [s: string]: string }
): string {
  const { messages, senders } = parseFile(filePath);

  return formatHtml({
    datePattern: datePattern,
    messages: messages,
    senders,
    senderAliases,
  });
}
