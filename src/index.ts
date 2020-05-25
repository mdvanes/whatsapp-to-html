import { parseFile } from "@parser/parser";
import { formatHtml, htmlPostamble, htmlPreamble } from "@formatter/format";
import { SenderDetails } from "@parser/types";

/**
 * @description The way the dates are formatted in the input file
 * @example
 * "DD/MM/YYYY",
 * "MM/D/YY"
 */
export type DatePattern = string;

/**
 * @param filePath
 * @param datePattern The way the dates are formatted in the input file
 */
export function whatsappToHtml(
  filePath: string,
  title: string,
  datePattern: DatePattern,
  locale: string,
  hideMeta: boolean,
  senderAliases?: { readonly [s: string]: SenderDetails }
): string {
  try {
    const { messages, senders } = parseFile(filePath, datePattern, senderAliases);

    return htmlPreamble(title) + formatHtml({
      datePattern: datePattern,
      messages: messages,
      senders,
      locale,
      hideMeta
    }) + htmlPostamble;
  } catch (error) {
    // tslint:disable-next-line:no-expression-statement
    console.error("Something went wrong: ", error.message);

    return "";
  }
}
