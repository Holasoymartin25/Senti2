import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PROGRAMAS_BIENESTAR, ProgramaBienestar } from '../../../core/data/programas-bienestar.data';

@Component({
  selector: 'app-programas-bienestar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './programas-bienestar.component.html',
  styleUrls: ['./programas-bienestar.component.css']
})
export class ProgramasBienestarComponent {
  programas = PROGRAMAS_BIENESTAR;
  expandedProgramId: string | null = null;

  toggleProgram(id: string): void {
    this.expandedProgramId = this.expandedProgramId === id ? null : id;
  }

  getProgram(id: string): ProgramaBienestar | undefined {
    return this.programas.find(p => p.id === id);
  }
}
