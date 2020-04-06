import { parseFile } from "@parser/parser";
import { formatHtml, htmlPostamble, htmlPreamble } from "@formatter/format";

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
  locale: string,
  hideMeta: boolean,
  senderAliases?: { readonly [s: string]: string }
): string {
  try {
    const { messages, senders } = parseFile(filePath);

    return htmlPreamble(title) + formatHtml({
      datePattern: datePattern,
      messages: messages,
      senders,
      senderAliases,
      locale,
      hideMeta
    }) + htmlPostamble;
  } catch (error) {
    // tslint:disable-next-line:no-expression-statement
    console.error("Something went wrong: ", error.message);

    return "";
  }
}
