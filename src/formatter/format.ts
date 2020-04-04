import { WhatsAppMessage, Sender, SenderTuple, SenderDetails } from "@parser/types";
import date from "date-and-time";
import 'date-and-time/plugin/two-digit-year';
import "date-and-time/locale/nl";
import randomColor from "randomcolor";

const messageTemplate =
  '<p class="{perspective}"><span style="color:{color}" class="participant">{sender}</span> {message} <time>{time}</time></p>';

//#region INTERNALS

function generateColors(count: number): ReadonlyArray<string> {
  return randomColor({
    luminosity: 'dark',
    count,
  }) as ReadonlyArray<string>;
}

function createMessageTemplate(color: string, sender: Sender, senderDetails: SenderDetails | false): string {
  return messageTemplate.replace(
    /{perspective}(.+){color}(.+){sender}/,
    (match, p1, p2) => {
      const perspective = senderDetails ? senderDetails.perspective : 'you';
      const senderStr = senderDetails ? `<span class="name" title="${senderDetails.phone}">${senderDetails.name}<span class="phone"> (${senderDetails.phone})</span></span>` : sender;

      return perspective + p1 + color + p2 + senderStr;
    }
  );
}

const formatAttachment = (message: string) => {
  if(message.indexOf('file attached') > -1) {
    const resultingMessage = message.replace(
      /(.*)\.(.*) \(file attached\)(.*)/,
      (match, attachmentName, attachmentExt, restMessage) => {
        if (attachmentExt === 'mp4') {
          return `<video controls><source src="videos/${attachmentName}.${attachmentExt}" type="video/mp4" /></video> ${restMessage}`;
        } else {
          return `<img src="images/${attachmentName}.${attachmentExt}" /> ${restMessage}`;
        }
      }
    );

    return resultingMessage;
  }

  if(message.indexOf('<Media omitted>') > -1) {
    const resultingMessage = message.replace(
      /(.*)<Media omitted>(.*)/,
      (match, p1, p2) => {
        return `${p1}(Media omitted)${p2}`;
      }
    );

    return resultingMessage;
  }

  return message;
};

function formatMessages(
  [currentMessage, ...messages]: ReadonlyArray<WhatsAppMessage>,
  messageTemplates: ReadonlyMap<Sender, string>,
  datePattern: string,
  locale: string = "",
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
    /{message}(.+){time}/,
    (match, p1) => formatAttachment(currentMessage.message) + p1 + currentMessage.time
  );

  if (currentMessage.date !== currentDate) {
    // @ts-ignore
    date.plugin('two-digit-year');
    const parsedDate = date.parse(currentMessage.date, datePattern);

    const formatString = locale === 'nl' ? "dddd, D MMMM YYYY" : "dddd, MMMM D, YYYY";
    if(locale === 'nl') {
      date.locale('nl');
    }

    const formattedDate = date.format(new Date(parsedDate), formatString);
    const dateHeader = `\n<h2><span>${formattedDate}</span></h2>\n`;

    return formatMessages(
      messages,
      messageTemplates,
      datePattern,
      locale,
      currentMessage.date,
      [...result, dateHeader, resultingMessage]
    );
  } else {
    return formatMessages(
      messages,
      messageTemplates,
      datePattern,
      locale,
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
  locale,
  senderAliases,
}: {
  readonly messages: ReadonlyArray<WhatsAppMessage>;
  readonly senders: ReadonlySet<SenderTuple>;
  readonly datePattern: string;
  readonly locale?: string;
  readonly senderAliases?: { readonly [s: string]: string };
}): string {
  const colors = generateColors([...senders].length);
  const messageTemplates: Map<Sender, string> = new Map(
    [...senders.values()].map(
      ([sender, senderDetails], i) =>
        [
          sender,
          createMessageTemplate(
            colors[i],
            (senderAliases && senderAliases[sender]) || sender,
            senderDetails
          ),
        ] as [string, string]
    )
  );

  return formatMessages(messages, messageTemplates, datePattern, locale).join("\n");
}

const style = `
<style>
:root {
    --shadow-rgb: 0, 0, 0;
    --you-bg: white;
    --me-bg: #dcf8c6;
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
    padding: 0.5rem 1.5rem;
    overflow-x: hidden;
    overflow-y: scroll;
    z-index: 10;
}

.avatar {
    background: #009688;
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

article img,
article video {
    border-radius: 5px;
    display: block;
    margin-bottom: 0.5rem;
    max-width: 200px;
}

article img {
    cursor: pointer;
}

article p {
    background: var(--you-bg);
    box-shadow: 1px 1px 2px 2px rgba(var(--shadow-rgb), 0.06);
    display: block;
    font-size: 0.8rem;
    padding: 0.5rem 0.5rem 0.1rem 0.5rem;
    width: 70%;
    position: relative;
}

article p.you {
    border-radius: 0 6px 6px 6px;
}

article p.you:after {
    right: 100%;
    top: 10px;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-right-color: var(--you-bg);
    border-width: 8px;
    margin-top: -10px;
    /*box-shadow: 1px 1px 2px 2px rgba(var(--shadow-rgb), 0.06);*/
    border-top-width: 0;
    border-bottom-width: 12px;
}

article p.me {
    background: var(--me-bg);
    border-radius: 6px 0 6px 6px;
    margin-left: calc(30% - 10px);
}

article p.me:after {
    right: -1rem;
    top: 10px;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-color: transparent;
    border-left-color: var(--me-bg);
    border-width: 8px;
    margin-top: -10px;
    /*box-shadow: 1px 1px 2px 2px rgba(var(--shadow-rgb), 0.06);*/
    border-top-width: 0;
    border-bottom-width: 12px;
}

article p .participant {
    display: block;
}

article p .name {
    cursor: pointer;
}

article p .phone {
    display: none;
}

article p time {
    display: block;
    color: #9f9f9f;
    font-size: 0.6rem;
    text-align: right;
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

#lightbox {
    border: none;
    padding: 1rem;
    height: calc(100vh - 2rem);
    width: calc(100vw - 2rem);
    top: 0;
    justify-content: center;
}

#lightbox[open=true] {
    cursor: pointer;
    display: flex;
}

#lightbox img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
}
</style>
<style media="print">
    body {
        background-color: transparent;
        border-top: 3rem solid transparent;
    }

    header h1 {
        background-color: lightgrey;
        font-size: 4rem;
        font-weight: bold;
        /* bug: In Chrome, with print styles, this causes problems with breaking in other elements: white-space: nowrap;*/
        overflow-x: hidden;
        text-overflow: ellipsis;        
    }
    
    header h1:before {
        content: 'My WhatsApp Story';
        display: block;
        font-family: sans-serif;
        font-size: 1rem;
        font-style: italic;
        font-weight: normal;
    }

    section#main {
        box-shadow: none;
        position: relative;
        width: auto;
        max-width: max-content;
    }
    
    section#main header {
        height: 150px;
    }

    section#main article {
        overflow: visible;
        column-count: 2;
        column-gap: 2em;
        padding: 0;
    }
    
    .avatar {
        height: 150px;
        width: 150px;
    }
    
    article h2 span {
        box-shadow: none;
    }
    
    article p {
        break-inside: avoid;
        box-shadow: none;
        width: 90%;
    }
    
    article p.me {
        margin-left: calc(10% - 20px);
    }
    
    article p.you:after,
    article p.me:after {
        border: none;
    }

    article p.you .participant {
        color: black !important;
    }

    article p .name {
        font-weight: bold;
    }

    article p .phone {
        display: inline;
    }

    article img {
        max-width: 100%;
    }
</style>
`;

export const htmlPreamble = (title: string) => `<!DOCTYPE html>
<html>
<head>
    <title>${title} ~ My WhatsApp Story</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${style}
</head>
<body>

<div id="wrapper">
    <section id="main">
        <div class="bg-chat"></div>
        <header>
            <img class="avatar" src="./images/profilepic.jpg" />
            <h1>${title}</h1>
        </header>
        <article>
`;

export const htmlPostamble = `
</article>
    </section>
</div>
<dialog id="lightbox"></dialog>
<script>
  const mediaElems = document.querySelectorAll('img');
  const dialog = document.querySelector('dialog');

  for(let i = 0; i < mediaElems.length; i++) {
    const mediaElem = mediaElems[i];

    // On click, add to lightbox
    mediaElem.addEventListener('click', (ev) => {
      const elemClone = ev.target.cloneNode(true);

      // On click in lightbox, remove from lightbox
      dialog.addEventListener('click', (ev) => {
        dialog.removeChild(elemClone);
        dialog.removeAttribute('open');
      });

      dialog.appendChild(elemClone);
      dialog.setAttribute('open', true);
    })
  }
</script>
</body></html>`;

//#endregion
