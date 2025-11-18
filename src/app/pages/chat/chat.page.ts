import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../services/chat';
import { ContratacionesService } from '../../services/contrataciones';
import { AuthService } from '../../services/auth';
import { Mensaje } from '../../models/mensaje.model';
import { Contratacion } from '../../models/contratacion.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('contentChat') contentChat: ElementRef | undefined;

  contratacionId: string = '';
  contratacion: Contratacion | null = null;
  mensajes: Mensaje[] = [];
  nuevoMensaje = '';
  loading = false;
  enviando = false;
  usuarioActualId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private contratacionesService: ContratacionesService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.usuarioActualId = this.authService.currentUser?.id || '';
    this.route.params.subscribe(async params => {
      this.contratacionId = params['id'];
      await this.loadContratacion();
      await this.loadMensajes();
      this.suscribirseAMensajes();
    });
  }

  ngOnDestroy() {
    this.chatService.unsubscribeFromMessages();
  }

  private async loadContratacion() {
    try {
      this.contratacion = await this.contratacionesService.getContratacionById(this.contratacionId);
    } catch (error) {
      console.error('Error al cargar contratación:', error);
    }
  }

  private async loadMensajes() {
    try {
      this.mensajes = await this.chatService.getMensajes(this.contratacionId);
      this.scrollAlFinal();
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }

  private suscribirseAMensajes() {
    this.chatService.subscribeToMessages(this.contratacionId);
    this.chatService.mensajes$.subscribe(mensajes => {
      this.mensajes = mensajes;
      this.scrollAlFinal();
    });
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    this.enviando = true;
    const mensaje = this.nuevoMensaje;
    this.nuevoMensaje = '';

    try {
      await this.chatService.enviarMensaje(this.contratacionId, mensaje);
      this.scrollAlFinal();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      this.nuevoMensaje = mensaje;
    } finally {
      this.enviando = false;
    }
  }

  private scrollAlFinal() {
    setTimeout(() => {
      if (this.contentChat) {
        this.contentChat.nativeElement.scrollToBottom(300);
      }
    }, 100);
  }

  esDelUsuario(remitenteId: string) {
    return remitenteId === this.usuarioActualId;
  }

  goBack() {
    this.router.navigate(['/mis-contrataciones']);
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }
}