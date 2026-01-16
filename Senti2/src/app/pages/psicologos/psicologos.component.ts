import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-psicologos',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './psicologos.component.html',
    styleUrls: ['./psicologos.component.css']
})
export class PsicologosComponent {
    specialists = [
        {
            name: 'Dra. Elena Morales',
            title: 'Experta en Terapia de Pareja y Relaciones',
            description: 'Especialista en terapia de pareja. Ayuda a las parejas a reconstruir la confianza y mejorar la comunicación, con un enfoque empático para resolver conflictos.',
            image: 'assets/elena.jpg'
        },
        {
            name: 'Dr. Alejandro Torres',
            title: 'Experto en Ansiedad, Estrés y Gestión Emocional',
            description: 'Especialista en el manejo de la ansiedad y el estrés. Proporciona herramientas prácticas para la gestión emocional, ayudando a los pacientes a encontrar el equilibrio y la calma en su día a día.',
            image: 'assets/alejandro.jpg',
            highlight: true
        },
        {
            name: 'Dra. Sofía Ramos',
            title: 'Experta en Autoestima, Desarrollo Personal y Superación',
            description: 'Enfocada en el desarrollo personal y la autoestima. Guía a los pacientes a través de procesos de superación, ayudándoles a reconectar con su confianza y a construir una autoimagen positiva.',
            image: 'assets/sofia.jpg'
        }
    ];
}
