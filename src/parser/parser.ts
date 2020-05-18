import * as fs from "fs";
import * as os from "os";

import { WhatsAppMessage, ParsedWhatsAppMessage, Sender, SenderDetails, SenderTuple } from "@parser/types";
import { sanitize } from "@utils/string";
// TODO make conditional depending on flag
import senderConfigJson from "../../sender-config.json";
import { DatePattern } from "../index";

//#region INTERNALS

const PARSE_REG_EXP: Record<string, RegExp> = {
  EN: /([\d\/]+),\s*([\d:]{4,}(?:\s*[AP]M)?) - (.*)/,
  NL: /([\d-]+) \s*([\d:]{4,}(?:\s*[AP]M)?) - (.*)/
};

const PARSE_REST_REG_EXP: Record<string, RegExp> = {
  EN: /([^:]+):\s*((.*)\(file attached\))?(.*)/,
  NL: /([^:]+):\s*((.*)\(bestand bijgevoegd\))?(.*)/
};

const createSenderDetailsFromJson = (senderStr, { name, phone, perspective }): SenderDetails => ({
  name,
  phone,
  perspective
});

function _parseMessage(message: string, parseRegExp: RegExp, parseRestRegExp: RegExp): ParsedWhatsAppMessage {
  function sanitizeSender(sender: string): string {
    return sanitize(sender, /[\+\s\d\p{L}]/u);
  }

  const res = parseRegExp.exec(message);

  if(res) {
    const [fullMatch, date, time, rest] = res;
    const restResult = parseRestRegExp.exec(rest);

    if(restResult) {
      const [restFullMatch, senderMatch, _, attachment, messageMatch] = restResult;
      const hasOmittedMedia = messageMatch === '<Media omitted>';
      const messageContent = hasOmittedMedia ? '' : messageMatch;
      const senderStr = sanitizeSender(senderMatch);
      const jsonEntry = senderConfigJson[senderStr];
      const senderDetails: SenderDetails | false = jsonEntry ? createSenderDetailsFromJson(senderStr, jsonEntry) : false;

      return {
        date,
        time,
        sender: senderStr,
        senderDetails,
        message: messageContent,
        isMeta: false,
        hasOmittedMedia,
        attachment: attachment ? attachment.trim() : false
      };
    } else {
      return {
        date,
        time,
        sender: "",
        senderDetails: false,
        message: rest,
        isMeta: true,
        hasOmittedMedia: false,
        attachment: false
      };
    }
  } else {
    return null;
  }
}

//#endregion

//#region EXPORTS

export function parseFile(
  path: string,
  datePattern: DatePattern
): {
  readonly messages: ReadonlyArray<WhatsAppMessage>;
  readonly senders: ReadonlySet<SenderTuple>;
} {
  const datePatternName = datePattern === "DD-MM-YYYY" ? "NL" : "EN";
  const parseRegExp = PARSE_REG_EXP[datePatternName] || PARSE_REG_EXP.EN;
  const parseRestRegExp =  PARSE_REST_REG_EXP[datePatternName] || PARSE_REST_REG_EXP.EN;

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
    message => _parseMessage(message, parseRegExp, parseRestRegExp) as WhatsAppMessage
  );
  // console.log('1', parsedMessages)
  const senders = new Set(parsedMessages.map((pm): SenderTuple => [pm.sender, pm.senderDetails]));

  return {
    messages: parsedMessages.filter(message => !!message),
    senders,
  };
}

//#endregion
