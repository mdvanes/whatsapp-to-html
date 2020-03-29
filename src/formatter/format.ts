import { WhatsAppMessage, Sender } from "@parser/types";
import date from "date-and-time";
import randomColor from "randomcolor";

const messageTemplate =
  '<p><span style="color:{color}">{sender}</span> @ <span style="color:grey;font-size:10px">{time}</span>: {message}</p>';

//#region INTERNALS

function generateColors(count: number): ReadonlyArray<string> {
  return randomColor({
    count,
  }) as ReadonlyArray<string>;
}

function createMessageTemplate(color: string, sender: Sender): string {
  return messageTemplate.replace(
    /{color}(.+){sender}/,
    (match, p1) => color + p1 + sender
  );
}

const formatAttachment = (message: string) => {
  if(message.indexOf('file attached') > -1) {
    // console.log('FILE ATTACHED', message);

    const resultingMessage = message.replace(
      /(.*)\.(.*) \(file attached\) (.*)/,
      (match, attachmentName, attachmentExt, restMessage) => {
        // console.log('FILEMATCH', match, '|', p1, '|', p2);
        if (attachmentExt === 'mp4') {
          // <video controls><source src="VID-20200203-WA0001.mp4" type="video/mp4"/></video>
          return `<video controls><source src="${attachmentName}.${attachmentExt}" type="video/mp4" /></video> ${restMessage}`;
        } else {
          return `<img src="${attachmentName}.${attachmentExt}" /> ${restMessage}`;
        }
      }
    );

    // console.log('RESULT', resultingMessage);
    return resultingMessage;
  }

  return message;
};

function formatMessages(
  [currentMessage, ...messages]: ReadonlyArray<WhatsAppMessage>,
  messageTemplates: ReadonlyMap<Sender, string>,
  datePattern: string,
  currentDate: string = "",
  result: ReadonlyArray<string> = [""]
): ReadonlyArray<string> {
  if (!currentMessage) return result;

  const template = messageTemplates.get(currentMessage.sender);
  if (!template)
    throw new Error(
      "unknown sender in message: " + JSON.stringify(currentMessage)
    );
  const resultingMessage = (template as string).replace(
    /{time}(.+){message}/,
    (match, p1) => currentMessage.time + p1 + formatAttachment(currentMessage.message)
  );

  if (currentMessage.date !== currentDate) {
    const parsedDate = date.parse(currentMessage.date, datePattern);
    const dateHeader =
      "\n<h2>" +
      date.format(new Date(parsedDate), "dddd, MMMM D, YYYY") +
      "</h2>\n";

    return formatMessages(
      messages,
      messageTemplates,
      datePattern,
      currentMessage.date,
      [...result, dateHeader, resultingMessage]
    );
  } else {
    return formatMessages(
      messages,
      messageTemplates,
      datePattern,
      currentMessage.date,
      [...result, resultingMessage]
    );
  }
}
//#endregion

//#region EXPORTS

export function formatHtml({
  messages,
  senders,
  datePattern,
  senderAliases,
}: {
  readonly messages: ReadonlyArray<WhatsAppMessage>;
  readonly senders: ReadonlySet<Sender>;
  readonly datePattern: string;
  readonly senderAliases?: { readonly [s: string]: string };
}): string {
  const colors = generateColors([...senders].length);
  const messageTemplates: Map<Sender, string> = new Map(
    [...senders.values()].map(
      (sender, i) =>
        [
          sender,
          createMessageTemplate(
            colors[i],
            (senderAliases && senderAliases[sender]) || sender
          ),
        ] as [string, string]
    )
  );

  return formatMessages(messages, messageTemplates, datePattern).join("\n");
}

export const prefix = (title: string) => `<!DOCTYPE html>
<html>
<head>
    <title>${title} ~ My WhatsApp Story</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>`;

export const suffix = `</body></html>`;

//#endregion
