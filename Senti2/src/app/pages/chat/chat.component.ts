import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, Message } from '../../core/services/message.service';
import { EchoService } from '../../core/services/echo.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface MessageGroup {
  date: string;
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: Message[] = [];
  groupedMessages: MessageGroup[] = [];
  newMessage = '';
  currentUserId!: number;
  currentUserRole!: string;
  otherUserId!: number;
  loading = true;

  partnerName = 'Cargando...';
  partnerRole = 'Especialista';
  partnerEmail = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private echoService: EchoService,
    private authService: AuthApiService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.otherUserId = Number(this.route.snapshot.paramMap.get('userId'));
    this.messageService.activeChatUserId = this.otherUserId;
    const user = this.authService.getCurrentUserValue();
    this.currentUserId = Number(user?.id);
    this.currentUserRole = user?.role || 'user';
    
    const token = this.authService.getToken() || '';
    this.echoService.init(token);

    this.loadMessages();
    this.loadChatPartnerDetails();

    this.echoService.listenToChat(this.currentUserId, this.otherUserId, (msg: Message) => {
      this.messages.push(msg);
      this.groupMessages();
      this.scrollToBottom();
      
      // Si el mensaje es del otro usuario, marcarlo como leído inmediatamente
      if (msg.sender_id === this.otherUserId) {
        this.messageService.markAsRead(this.otherUserId).subscribe();
      }
    });
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessages(this.otherUserId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.groupMessages();
        this.loading = false;
        this.scrollToBottom();
        this.messageService.markAsRead(this.otherUserId).subscribe();
      },
      error: () => { 
        this.loading = false; 
      }
    });
  }

  loadChatPartnerDetails() {
    // Si el rol es psicólogo, el chat partner es el paciente. Si no, es su psicólogo.
    if (this.currentUserRole === 'psicologo') {
      this.http.get<any>(`${environment.apiUrl}/psicologo/pacientes/${this.otherUserId}/datos`).subscribe({
        next: (res) => {
          if (res && res.user) {
            this.partnerName = res.user.name || res.user.email;
            this.partnerRole = 'Paciente Senti2';
            this.partnerEmail = res.user.email;
          } else {
            this.fallbackPartnerDetails();
          }
        },
        error: () => {
          this.fallbackPartnerDetails();
        }
      });
    } else {
      this.http.get<any>(`${environment.apiUrl}/mi-psicologo`).subscribe({
        next: (res) => {
          if (res && res.psicologo) {
            this.partnerName = res.psicologo.name || res.psicologo.email;
            this.partnerRole = 'Psicólogo/a Especialista';
            this.partnerEmail = res.psicologo.email;
          } else {
            this.fallbackPartnerDetails();
          }
        },
        error: () => {
          this.fallbackPartnerDetails();
        }
      });
    }
  }

  fallbackPartnerDetails() {
    const otherMsg = this.messages.find(m => m.sender_id === this.otherUserId);
    if (otherMsg && otherMsg.sender) {
      this.partnerName = otherMsg.sender.name || otherMsg.sender.email;
      this.partnerEmail = otherMsg.sender.email;
    } else {
      this.partnerName = 'Especialista';
    }
  }

  send() {
    if (!this.newMessage.trim()) return;
    this.messageService.sendMessage(this.otherUserId, this.newMessage).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.groupMessages();
        this.newMessage = '';
        this.scrollToBottom();
      }
    });
  }

  groupMessages() {
    const groups: MessageGroup[] = [];
    
    this.messages.forEach(msg => {
      const dateHeader = this.formatDateHeader(msg.created_at);
      let group = groups.find(g => g.date === dateHeader);
      if (!group) {
        group = { date: dateHeader, messages: [] };
        groups.push(group);
      }
      group.messages.push(msg);
    });

    this.groupedMessages = groups;
  }

  isNewDay(message: Message, previousMessage: Message | null): boolean {
    if (!previousMessage) return true;
    const d1 = new Date(message.created_at);
    const d2 = new Date(previousMessage.created_at);
    return d1.toDateString() !== d2.toDateString();
  }

  formatDateHeader(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
      const formatted = d.toLocaleDateString('es-ES', options);
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
  }

  getInitials(name: string): string {
    if (!name || name === 'Cargando...') return '?';
    // Limpiar títulos comunes
    const cleanName = name.replace(/^(Dra\.|Dr\.)\s+/i, '');
    const parts = cleanName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  goBack(): void {
    if (this.currentUserRole === 'psicologo') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/area-personal']);
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  ngOnDestroy() {
    this.messageService.activeChatUserId = null;
    this.echoService.leaveChat(this.currentUserId, this.otherUserId);
  }
}