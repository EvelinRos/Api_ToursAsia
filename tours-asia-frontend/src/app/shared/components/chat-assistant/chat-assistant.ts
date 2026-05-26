import {
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatAssistantService } from '../../../core/services/chat-assistant.service';
import { FAQ_SUGGESTIONS } from '../../../core/data/faq-data';

@Component({
  selector: 'app-chat-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-assistant.html',
  styleUrl: './chat-assistant.css',
})
export class ChatAssistantComponent {
  readonly chat = inject(ChatAssistantService);
  readonly suggestions = FAQ_SUGGESTIONS;

  isOpen = signal(false);
  draft = '';

  private messagesEl = viewChild<ElementRef<HTMLDivElement>>('messagesEl');

  constructor() {
    afterNextRender(() => this.scrollToBottom());
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      setTimeout(() => this.scrollToBottom(), 50);
    }
  }

  send(): void {
    const text = this.draft.trim();
    if (!text) return;
    this.chat.sendUserMessage(text);
    this.draft = '';
    setTimeout(() => this.scrollToBottom(), 30);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  pickSuggestion(faqId: string): void {
    this.chat.askFaqById(faqId);
    setTimeout(() => this.scrollToBottom(), 30);
  }

  clearChat(): void {
    if (confirm('¿Borrar el historial de esta conversación?')) {
      this.chat.clearHistory();
      setTimeout(() => this.scrollToBottom(), 30);
    }
  }

  formatContent(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    const el = this.messagesEl()?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
