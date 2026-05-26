import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';
import { ChatAssistantComponent } from './shared/components/chat-assistant/chat-assistant';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, ChatAssistantComponent],
  template: `
    <app-toast></app-toast>
    <router-outlet />
    <app-chat-assistant />
  `,
  styles: []
})
export class App {}