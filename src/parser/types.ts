export interface SenderDetails {
  readonly name: string;
  readonly phone: string;
  readonly perspective: "me" | "you";
}

export type Sender = string;

export interface WhatsAppMessage {
  readonly date: string;
  readonly time: string;
  /** @description Phone number or name */
  readonly sender: Sender;
  readonly senderDetails: SenderDetails | false;
  readonly message: string;
}

export type SenderTuple = [Sender, SenderDetails | false];

export type ParsedWhatsAppMessage = WhatsAppMessage | null;
