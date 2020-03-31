import * as fs from "fs";
import * as os from "os";

import { WhatsAppMessage, ParsedWhatsAppMessage, Sender, SenderDetails, SenderTuple } from "@parser/types";
import { sanitize } from "@utils/string";
// TODO make conditional depending on flag
import senderConfigJson from "../../sender-config.json";

//#region INTERNALS

const parseRegExp = /([\d\/]+),\s*([\d:]{4,}(?:\s*[AP]M)?)([^:]+):\s*(.*)/;

const createSenderDetailsFromJson = (senderStr, { name, phone, perspective }): SenderDetails => ({
  name,
  phone,
  perspective
});

function _parseMessage(message: string): ParsedWhatsAppMessage {
  function sanitizeSender(sender: string): string {
    return sanitize(sender, /[\+\s\d\p{L}]/u);
  }

  const res = parseRegExp.exec(message);

  if(res) {
    const senderStr = sanitizeSender(res[3]);
    const jsonEntry = senderConfigJson[senderStr];
    const senderDetails: SenderDetails | false = jsonEntry ? createSenderDetailsFromJson(senderStr, jsonEntry) : false;

    return {
      date: res[1],
      time: res[2],
      sender: senderStr,
      senderDetails,
      message: res[4],
    };
  } else {
    return null;
  }
}

//#endregion

//#region EXPORTS

export function parseFile(
  path: string
): {
  readonly messages: ReadonlyArray<WhatsAppMessage>;
  readonly senders: ReadonlySet<SenderTuple>;
} {
  const content = fs.readFileSync(path).toString();
  const messages = content.split(os.EOL).reduce((prev, cur) => {
    if (parseRegExp.test(cur)) return [...prev, cur];
    else {
      const lastMessage = prev[prev.length - 1];
      const lastMessageWithAppendedChunk = lastMessage + " " + cur;

      return [...prev.slice(0, prev.length - 1), lastMessageWithAppendedChunk];
    }
  }, []);
  const parsedMessages = messages.map(
    message => _parseMessage(message) as WhatsAppMessage
  );
  const senders = new Set(parsedMessages.map((pm): SenderTuple => [pm.sender, pm.senderDetails]));

  return {
    messages: parsedMessages.filter(message => !!message),
    senders,
  };
}

//#endregion
