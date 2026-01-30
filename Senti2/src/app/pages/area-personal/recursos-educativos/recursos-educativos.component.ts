import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ARTICULOS, EJERCICIOS, Articulo, Ejercicio } from '../../../core/data/recursos-educativos.data';

@Component({
  selector: 'app-recursos-educativos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recursos-educativos.component.html',
  styleUrls: ['./recursos-educativos.component.css']
})
export class RecursosEducativosComponent {
  articulos = ARTICULOS;
  ejercicios = EJERCICIOS;
  expandedArticleId: string | null = null;
  expandedExerciseId: string | null = null;

  toggleArticle(id: string): void {
    this.expandedArticleId = this.expandedArticleId === id ? null : id;
    if (this.expandedArticleId === id) this.expandedExerciseId = null;
  }

  toggleExercise(id: string): void {
    this.expandedExerciseId = this.expandedExerciseId === id ? null : id;
    if (this.expandedExerciseId === id) this.expandedArticleId = null;
  }

  getArticle(id: string): Articulo | undefined {
    return this.articulos.find(a => a.id === id);
  }

  getExercise(id: string): Ejercicio | undefined {
    return this.ejercicios.find(e => e.id === id);
  }
}
