import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../../core/services/message.service';
import { EchoService } from '../../core/services/echo.service';
import { AuthApiService } from '../../core/services/auth-api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  newMessage = '';
  currentUserId!: number;
  otherUserId!: number;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private echoService: EchoService,
    private authService: AuthApiService
  ) {}

  ngOnInit() {
    this.otherUserId = Number(this.route.snapshot.paramMap.get('userId'));
    const user = this.authService.getCurrentUserValue();
    this.currentUserId = Number(user?.id);
    
    const token = localStorage.getItem('token') || '';
    this.echoService.init(token);

    this.loadMessages();

    this.echoService.listenToChat(this.currentUserId, this.otherUserId, (msg: Message) => {
      this.messages.push(msg);
      this.scrollToBottom();
    });
  }

  loadMessages() {
    this.loading = true;
    this.messageService.getMessages(this.otherUserId).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.loading = false;
        this.scrollToBottom();
        this.messageService.markAsRead(this.otherUserId).subscribe();
      },
      error: () => { this.loading = false; }
    });
  }

  send() {
    if (!this.newMessage.trim()) return;
    this.messageService.sendMessage(this.otherUserId, this.newMessage).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.scrollToBottom();
      }
    });
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
    this.echoService.leaveChat(this.currentUserId, this.otherUserId);
  }
}