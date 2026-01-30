import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-area-personal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './area-personal.component.html',
  styleUrls: ['./area-personal.component.css']
})
export class AreaPersonalComponent {}
