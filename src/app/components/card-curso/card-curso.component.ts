import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-curso',
  templateUrl: './card-curso.component.html',
  styleUrls: ['./card-curso.component.scss'],
})
export class CardCursoComponent {
  @Input() name?: string;
}
