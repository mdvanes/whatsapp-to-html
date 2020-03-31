interface SenderObj {
  readonly name: string;
  readonly phone: string;
  readonly perspective: "me" | "you";
}

export type Sender = string | SenderObj;

export interface WhatsAppMessage {
  readonly date: string;
  readonly time: string;
  /** @description Phone number or name */
  readonly sender: Sender;
  readonly message: string;
}

export type ParsedWhatsAppMessage = WhatsAppMessage | null;
