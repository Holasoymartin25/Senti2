import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatAiService } from '../../core/services/chat-ai.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  date: Date;
}

const FALLBACK_REPLY =
  'Ahora mismo no puedo conectarme al asistente. Puedes escribir de nuevo en unos minutos o visitar el Chat de Apoyo del Área Personal.';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css']
})
export class ChatWidgetComponent {
  @ViewChild('chatBody') private chatBody?: ElementRef<HTMLDivElement>;
  isOpen = false;
  isLoading = false;
  newMessage = '';
  messages: ChatMessage[] = [
    {
      role: 'assistant',
      text: 'Hola, soy tu asistente de apoyo. ¿En qué puedo ayudarte hoy?',
      date: new Date()
    }
  ];

  constructor(private chatAi: ChatAiService) {}

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  async sendMessage(): Promise<void> {
    const text = (this.newMessage || '').trim();
    if (!text || this.isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text, date: new Date() };
    this.messages.push(userMsg);
    this.newMessage = '';
    this.isLoading = true;
    this.scrollToBottom();

    try {
      const reply = await this.chatAi.ask(text, this.messages);
      this.messages.push({
        role: 'assistant',
        text: reply || FALLBACK_REPLY,
        date: new Date()
      });
      this.scrollToBottom();
    } catch {
      this.messages.push({
        role: 'assistant',
        text: FALLBACK_REPLY,
        date: new Date()
      });
      this.scrollToBottom();
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.chatBody?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 0);
  }
}
