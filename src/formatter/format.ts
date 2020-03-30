import { WhatsAppMessage, Sender } from "@parser/types";
import date from "date-and-time";
import randomColor from "randomcolor";

const messageTemplate =
  '<p><span style="color:{color}" class="participant">{sender}</span> @ <span style="color:grey;font-size:10px">{time}</span>: {message}</p>';

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
          return `<video controls><source src="videos/${attachmentName}.${attachmentExt}" type="video/mp4" /></video> ${restMessage}`;
        } else {
          return `<img src="images/${attachmentName}.${attachmentExt}" /> ${restMessage}`;
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
      "\n<h2><span>" +
      date.format(new Date(parsedDate), "dddd, MMMM D, YYYY") +
      "</span></h2>\n";

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

export const htmlPreamble = (title: string) => `<!DOCTYPE html>
<html>
<head>
    <title>${title} ~ My WhatsApp Story</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>

:root {
    --shadow-rgb: 0, 0, 0;
}

html, body {
    margin: 0;
}

body {
    background-color: #d3dbda;
    border-top: 125px solid #009688;
}

#wrapper {
    display: flex;
    justify-content: center;
}

section#main {
    background-color: #e5ddd5;
    box-shadow: 0 1px 1px 0 rgba(var(--shadow-rgb), 0.06),0 2px 5px 0 rgba(var(--shadow-rgb), 0.2);
    width: calc(100vw - 30px);
    max-width: 800px;
    position: fixed;
    height: calc(100vh - 30px);
    top: 15px;

    display: flex;
    flex-direction: column;

    font-family: sans-serif;
}

section#main header {
    background-color: #ededed;
    height: 50px;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    z-index: 10;
}

.bg-chat {
    background: #e5ddd5 url("./images/bg-chat-tile.png");
    position: absolute;
    top: 0;
    height: 100%;
    width: 100%;
    opacity: 0.06;
}

section#main article {
    flex: 1 0 0;
    padding: 0.5rem;
    overflow-x: hidden;
    overflow-y: scroll;
    z-index: 10;
}

.avatar {
    background: #009688 url("./images/profilepic.jpg") center/100%;
    border-radius: 50%;
    height: 50px;
    width: 50px;
    margin-right: 1rem;
}

header h1 {
    font-size: 1.1rem;
    font-weight: normal;
    margin: 0;
}

article img {
    width: 100px;
}

article p {
    background: white;
    border-radius: 6px;
    box-shadow: 1px 1px 2px 2px rgba(var(--shadow-rgb), 0.06);
    display: block;
    font-size: 0.8rem;
    padding: 0.5rem;
    width: 70%;
}

article p .participant {
    display: block;
}

article h2 {
    display: flex;
    justify-content: center;
}

article h2 span {
    background: #e1f2fb;
    border-radius: 6px;
    box-shadow: 1px 1px 2px 2px rgba(var(--shadow-rgb), 0.06);
    font-size: 1rem;
    font-weight: normal;
    padding: 0.5rem;
    text-align: center;
    width: 300px;
}
    </style>
</head>
<body>

<div id="wrapper">
    <section id="main">
        <div class="bg-chat"></div>
        <header>
            <div class="avatar"></div>
            <h1>${title}</h1>
        </header>
        <article>
`;

export const htmlPostamble = `
</article>
    </section>
</div>
</body></html>`;

//#endregion
