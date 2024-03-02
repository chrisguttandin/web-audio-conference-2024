import { Routes } from '@angular/router';
import { SlideOneComponent } from './slide-one/slide-one.component';
import { SlideThreeComponent } from './slide-three/slide-three.component';
import { SlideTwoComponent } from './slide-two/slide-two.component';
import { SlidesComponent } from './slides.component';

export const routes: Routes = [
    {
        children: [
            {
                component: SlideOneComponent,
                path: '1'
            },
            {
                component: SlideTwoComponent,
                path: '2'
            },
            {
                component: SlideThreeComponent,
                path: '3'
            },
            {
                path: '**',
                redirectTo: '1'
            }
        ],
        component: SlidesComponent,
        path: ''
    }
];
