import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface ChatMessage {
  id: string;
  role: 'user' | 'support';
  text: string;
  date: Date;
}

const AUTO_REPLY = 'Gracias por tu mensaje. Este chat es un espacio de apoyo en modo demostración: en una versión con profesionales conectados, tu mensaje sería atendido por un psicólogo o profesional de salud mental. Si estás pasando por una crisis o necesitas hablar con alguien ya, puedes usar las líneas de ayuda 24h que aparecen debajo. No sustituyen una evaluación profesional, pero ofrecen escucha y contención.';

@Component({
  selector: 'app-chat-apoyo',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './chat-apoyo.component.html',
  styleUrls: ['./chat-apoyo.component.css']
})
export class ChatApoyoComponent {
  messages: ChatMessage[] = [];
  newMessage = '';

  sendMessage(): void {
    const text = (this.newMessage || '').trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text,
      date: new Date()
    };
    this.messages.push(userMsg);
    this.newMessage = '';

    const supportMsg: ChatMessage = {
      id: `s_${Date.now()}`,
      role: 'support',
      text: AUTO_REPLY,
      date: new Date()
    };
    this.messages.push(supportMsg);
  }
}
