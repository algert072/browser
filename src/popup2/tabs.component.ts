import {
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-tabs',
    template: `
        <router-outlet></router-outlet>
        <nav class="tabs">
            <ul>
                <li routerLinkActive="active">
                    <a routerLink="current" title="{{'currentTab' | i18n}}">
                        <i class="fa fa-folder fa-2x"></i>{{'tab' | i18n}}
                    </a>
                </li>
                <li routerLinkActive="active">
                    <a routerLink="vault" title="{{'myVault' | i18n}}">
                        <i class="fa fa-lock fa-2x"></i>{{'myVault' | i18n}}
                    </a>
                </li>
                <li routerLinkActive="active">
                    <a routerLink="tools" title="{{'tools' | i18n}}">
                        <i class="fa fa-wrench fa-2x"></i>{{'tools' | i18n}}
                    </a>
                </li>
                <li routerLinkActive="active">
                    <a routerLink="settings" title="{{'settings' | i18n}}">
                        <i class="fa fa-cogs fa-2x"></i>{{'settings' | i18n}}
                    </a>
                </li>
            </ul>
        </nav>`,
})
export class TabsComponent { }