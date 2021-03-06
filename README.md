# MyWhatsAppStory

My WhatsApp Story, my-whatsapp-story

A tool to convert a WhatsApp (group) conversation to a stand-alone HTML.

There are other tools like this, most notably [WhatsApp Viewer](https://andreas-mausch.de/whatsapp-viewer/) but there are some differences.

Heavily based on [whatsapp-to-html](https://github.com/danplisetsky/whatsapp-to-html) (see below in this readme)
Many thanks to [Daniel Plisetsky](https://github.com/danplisetsky) and [Andreas Mausch](https://github.com/andreas-mausch).

## Features

* DOES NOT WORK: _Differs from the original whatsapp-to-html because it can take the ["full export"](http://forum.xda-developers.com/showthread.php?t=2770982) for [large chats](https://www.imyfone.com/whatsapp/how-to-export-large-whatsapp-chat/) as input, instead of the normal export that is limited to 10.000 messages with media files._
* The generated HTML is very simple, so it should function on a very large term (years)
* The HTML looks like a WhatsApp conversation
* It can convert the HTML (by using CSS print styles) to PDF
* The HTML inlines the used media
* External config that maps phone numbers for participants to their name. The config also allows specifying what participant has the "me" perspective in the conversation, and as such will be aligned to the right. Multiple participants can have the "me" perspective.
* l10n for Dutch dates: by the default the output has date headers that look like this: <h2>Thursday, January 30, 2020</h2> but it should support <h2>Donderdag, 30 januari 2020</h2>

## TODO

* technical debt: consolidate sender-config.json import with senderAliasesPath in cli.ts
* technical debt: move attachment detection from format to parsing
* enhancement: Print styles: what do with video?
* enhancement: Print styles: align time stamps to left, 
* enhancement: Print styles: use serif font?, 
* enhancement: font-size on mobile may be too small
* enhancement: next/prev day button

## Changelog

* fixed bug: initial message & people added/left messages should not get merged into other messages
* added --hide-meta flag to disable meta messages 
* i10n for Dutch date formatting
* Print styles: fix profilepic, 2 columns, remove balloon outlines, prevent page breaks on paragraphs, paragraphs 90% width
  show telnr, remove colors for contact name on you perspective, add supertitle line to document title with "My WhatsApp Story:" and use larger and bolder font here
* media lightbox
* fixed green arrow on mobile is not visible
* fixed bug: media is not replaced if there is no space following "file attached)", e.g.  VID-20200318-WA0004.mp4 (file attached)
* Replace <Media ommitted> by (Media ommitted)
* add line break after img/video. 
* random colors should be only high contrast
* manual: old media
* manual: participants
* The HTML inlines the used media
* Also support webp

## No support for / bugs:

* WhatsApp stickers from export without media, manually exporting is very cumbersome

## Usage

This version is NOT published to NPM at the moment. To run:

* git checkout
* npm i
* npm start
* ./bin/cli -t "Title" -d M/D/YYYY -l "nl" --hide-meta -- whatsapp_export.txt > result.html
    * where -t is the title that is shown at the start of the document
    * where -l is the optional locale, if not supplied "en" is used, otherwise only "nl" is supported
    * --hide-meta optional flag to hide meta messages (default is false)

## DOES NOT WORK! To retrieve a full export

### Step 1 (old, does not work for Android 9?)

Should not work anymore: https://plainsec.org/extracting-cipher-key-from-whatsapp-on-android-7-and-greater-without-root/

Follow https://forum.xda-developers.com/showthread.php?t=2770982:

* Extract WhatsApp-Key-DB-Extractor-master.zip maintaining the directory structure.
* Click on WhatsAppKeyDBExtract.bat (Windows) or WhatsAppKeyDBExtract.sh (Mac OS X / Linux).
* Connect your device via USB, unlock your screen and wait for Full backup to appear.
* Enter your backup password or leave blank (if none set) and tap on Back up my data.
* Confirm backup password in your command console and then check the "extracted" folder.

### Step 1 (2019)

add adb to path
https://github.com/MarcoG3/WhatsDump
can't run ./whatsdump-linux-x86_64 --install-sdk


### Step 2

* Use WhatsApp Viewer to export to (CSV?)

# Original Readme for whatsapp-to-html...

**whatsapp-to-html &middot; [![Build Status](https://travis-ci.org/danplisetsky/whatsapp-to-html.svg?branch=master)](https://travis-ci.org/danplisetsky/whatsapp-to-html) [![npm](https://img.shields.io/npm/v/whatsapp-to-html.svg)](https://www.npmjs.com/package/whatsapp-to-html)**  

## The problem

Currently, WhatsApp lets you export chats only in the plain .txt format, which is difficult to read. It'd be nice to have those chats nicely formatted.

## The solution

```bash
$ npm install -g whatsapp-to-html
```

It comes with a command line program and a user-facing API.

## Usage

### CLI

`whatsapp-to-html` expects a [date pattern][date-pattern] and an exported WhatsApp chat. You can also optionally pass it a path to a JSON file, which should be a map of the interlocutors in the provided WhatsApp chat to strings, which will be used as aliases. See an example below.

Thus, the flags are:

```
-d              A date pattern
-a              A path to a JSON file containing aliases for the participants in the provided chat
```

The last argument should a the path to an exported WhatsApp chat.

The resulting HTML will be written to `stdout`.

#### Examples

Let's say we have the following chat exported from WhatsApp in a `_chat.txt` file:

```
[12/05/2019, 3:32:47 PM] Daniel: Who are you?
[12/05/2019, 3:33:14 PM] Mysterion: I’m an angel keeping watch over the city at night
[12/05/2019, 3:43:46 PM] Daniel: Are you Craig?
[12/05/2019, 3:48:09 PM] Mysterion: I might be Craig, and then again, I might not be. My identity must remain a secret. You cannot know.
[12/05/2019, 3:48:41 PM] Daniel: What are you doing here?
[12/05/2019, 3:49:32 PM] Mysterion: The city needs my help. It cries for protection, and I will answer the call to save her.
[13/05/2019, 8:00:43 AM] Mysterion: Today you crossed paths with the wrong immortal fourth grader
[13/05/2019, 2:53:14 PM] Daniel: Right. This conversation is over.
```

According to [this table][date-pattern], the date pattern in this file is DD/MM/YYYY. Running this

```bash
$ whatsapp-to-html -d DD/MM/YYYY -- _chat.txt > out.html
```

will produce the following `out.html`

```html
<h2>Sunday, May 12, 2019</h2>

<p>
  <span style="color:#ed6f42">Daniel</span> @
  <span style="color:grey;font-size:10px">3:32:47 PM</span>: Who are you?
</p>
<p>
  <span style="color:#c4e559">Mysterion</span> @
  <span style="color:grey;font-size:10px">3:33:14 PM</span>: I’m an angel
  keeping watch over the city at night
</p>
<p>
  <span style="color:#ed6f42">Daniel</span> @
  <span style="color:grey;font-size:10px">3:43:46 PM</span>: Are you Craig?
</p>
<p>
  <span style="color:#c4e559">Mysterion</span> @
  <span style="color:grey;font-size:10px">3:48:09 PM</span>: I might be Craig,
  and then again, I might not be. My identity must remain a secret. You cannot
  know.
</p>
<p>
  <span style="color:#ed6f42">Daniel</span> @
  <span style="color:grey;font-size:10px">3:48:41 PM</span>: What are you doing
  here?
</p>
<p>
  <span style="color:#c4e559">Mysterion</span> @
  <span style="color:grey;font-size:10px">3:49:32 PM</span>: The city needs my
  help. It cries for protection, and I will answer the call to save her.
</p>

<h2>Monday, May 13, 2019</h2>

<p>
  <span style="color:#c4e559">Mysterion</span> @
  <span style="color:grey;font-size:10px">8:09:43 PM</span>: Today you crossed
  paths with the wrong immortal fourth grader
</p>
<p>
  <span style="color:#ed6f42">Daniel</span> @
  <span style="color:grey;font-size:10px">2:30:14 PM</span>: Right. This
  conversation is over.
</p>
```

It will look [like this](https://codepen.io/danplisetsky/pen/MNwEBB), which is much more readable.

Optionally, you can create a JSON file (let's call it `_chat.json`):

```json
{
  "Mysterion": "Kenny"
}
```

If you passed it to the program, you'd get this:

```bash
$ whatsapp-to-html -d DD/MM/YYYY -a _chat.json -- _chat.txt > out.html
```

`out.html`:

```html
<h2>Sunday, May 12, 2019</h2>

<p>
  <span style="color:#48e2dd">Daniel</span> @
  <span style="color:grey;font-size:10px">3:32:47 PM</span>: Who are you?
</p>
<p>
  <span style="color:#e28f85">Kenny</span> @
  <span style="color:grey;font-size:10px">3:33:14 PM</span>: I’m an angel
  keeping watch over the city at night
</p>
<p>
  <span style="color:#48e2dd">Daniel</span> @
  <span style="color:grey;font-size:10px">3:43:46 PM</span>: Are you Craig?
</p>
<p>
  <span style="color:#e28f85">Kenny</span> @
  <span style="color:grey;font-size:10px">3:48:09 PM</span>: I might be Craig,
  and then again, I might not be. My identity must remain a secret. You cannot
  know.
</p>
<p>
  <span style="color:#48e2dd">Daniel</span> @
  <span style="color:grey;font-size:10px">3:48:41 PM</span>: What are you doing
  here?
</p>
<p>
  <span style="color:#e28f85">Kenny</span> @
  <span style="color:grey;font-size:10px">3:49:32 PM</span>: The city needs my
  help. It cries for protection, and I will answer the call to save her.
</p>

<h2>Monday, May 13, 2019</h2>

<p>
  <span style="color:#e28f85">Kenny</span> @
  <span style="color:grey;font-size:10px">8:09:43 PM</span>: Today you crossed
  paths with the wrong immortal fourth grader
</p>
<p>
  <span style="color:#48e2dd">Daniel</span> @
  <span style="color:grey;font-size:10px">2:30:14 PM</span>: Right. This
  conversation is over.
</p>
```

`Mysterion` is now displayed as `Kenny`, which is just as well.

### API

After installing the library, `import` it:

```javascript
import { whatsappToHtml } from "whatsapp-to-html";
```

or `require` it:

```javascript
const whatsappToHtml = require("whatsapp-to-html").whatsappToHtml;
```

#### whatsappToHtml(filePath, datePattern, senderAliases?)

- @param {**string**} filePath
- @param {**string**} datePattern
- @param {**{ readonly [s: string]: string }**} [senderAliases]

```javascript
const html = whatsappToHtml("./_chat.txt", "DD/MM/YYYY", {
  Mysterion: "Kenny",
});
```

This will return the same html as we saw before.

## Notes

- The colors are assigned to chat participants at random. If you don't like the result, run the program again
- If there are chat participants identified by their phone numbers, use the following rule to properly map them to names (or whatever you'd like to map them to. Maybe different numbers. Who knows):
  - Remove all the dashes and parentheses, if there are any, from the number, but keep the spaces. For instance, if the number is `(+451 12-34-5678)`, use `"+451 12345678"` as a key in your JSON file / object

[date-pattern]: https://www.npmjs.com/package/date-and-time#parsedatestring-formatstring-utc
