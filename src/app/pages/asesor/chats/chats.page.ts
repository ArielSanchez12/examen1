import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ContratacionesService } from '../../../services/contrataciones';
import { Contratacion } from '../../../models/contratacion.model';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class ChatsPage implements OnInit {
  contratacionesConChat: Contratacion[] = [];
  loading = false;
  searchText = '';

  constructor(
    private contratacionesService: ContratacionesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadContrataciones();
  }

  private async loadContrataciones() {
    this.loading = true;
    try {
      const contrataciones = await this.contratacionesService.getAllContrataciones();
      // Filtrar solo aprobadas para mostrar en chats
      this.contratacionesConChat = contrataciones.filter(c => c.estado === 'aprobada');
    } catch (error) {
      console.error('Error al cargar contrataciones:', error);
    } finally {
      this.loading = false;
    }
  }

  getContratacionesFiltradas() {
    if (!this.searchText) {
      return this.contratacionesConChat;
    }

    const search = this.searchText.toLowerCase();
    return this.contratacionesConChat.filter(c =>
      c.usuario?.nombre?.toLowerCase().includes(search) ||
      c.usuario?.email?.toLowerCase().includes(search) ||
      c.plan?.nombre?.toLowerCase().includes(search)
    );
  }

  irAlChat(contratacionId: string) {
    this.router.navigate(['/chat', contratacionId]);
  }

  reloadContrataciones() {
    this.loadContrataciones();
  }
}