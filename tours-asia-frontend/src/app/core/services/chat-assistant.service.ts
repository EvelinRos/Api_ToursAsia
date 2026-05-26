import { Injectable, signal } from '@angular/core';
import {
  ASSISTANT_FALLBACK,
  ASSISTANT_WELCOME,
  FAQ_ENTRIES,
  FaqEntry,
} from '../data/faq-data';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'toursasia_chat_history';
const MAX_MESSAGES = 80;

@Injectable({ providedIn: 'root' })
export class ChatAssistantService {
  readonly messages = signal<ChatMessage[]>([]);
  private idCounter = 0;

  constructor() {
    this.loadFromStorage();
    if (this.messages().length === 0) {
      this.appendAssistant(ASSISTANT_WELCOME);
    }
  }

  sendUserMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.appendUser(trimmed);
    const reply = this.matchFaq(trimmed);
    this.appendAssistant(reply);
  }

  askFaqById(faqId: string): void {
    const entry = FAQ_ENTRIES.find((f) => f.id === faqId);
    if (!entry) return;
    this.appendUser(entry.label);
    this.appendAssistant(entry.answer);
  }

  clearHistory(): void {
    this.messages.set([]);
    this.persist();
    this.appendAssistant(ASSISTANT_WELCOME);
  }

  private matchFaq(message: string): string {
    const normalized = this.normalize(message);
    let best: FaqEntry | null = null;
    let bestScore = 0;

    for (const entry of FAQ_ENTRIES) {
      const score = entry.keywords.reduce((acc, kw) => {
        const nkw = this.normalize(kw);
        return acc + (normalized.includes(nkw) ? 1 : 0);
      }, 0);
      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    }

    return bestScore > 0 && best ? best.answer : ASSISTANT_FALLBACK;
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ');
  }

  private appendUser(content: string): void {
    this.push({ role: 'user', content });
  }

  private appendAssistant(content: string): void {
    this.push({ role: 'assistant', content });
  }

  private push(partial: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    const msg: ChatMessage = {
      id: `msg-${this.idCounter++}-${Date.now()}`,
      timestamp: Date.now(),
      ...partial,
    };
    this.messages.update((list) => {
      const next = [...list, msg];
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next;
    });
    this.persist();
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        this.messages.set(parsed);
        this.idCounter = parsed.length;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages()));
    } catch {
      /* quota exceeded — ignore */
    }
  }
}
