import {
    ChangeDetectorRef,
    Component,
    NgZone,
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import { Location } from '@angular/common';

import { SendView } from 'jslib/models/view/sendView';

import { SendComponent as BaseSendComponent } from 'jslib/angular/components/send/send.component';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { PolicyService } from 'jslib/abstractions/policy.service';
import { SearchService } from 'jslib/abstractions/search.service';
import { SendService } from 'jslib/abstractions/send.service';
import { StateService } from 'jslib/abstractions/state.service';
import { UserService } from 'jslib/abstractions/user.service';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { PopupUtilsService } from '../services/popup-utils.service';

import { SendType } from 'jslib/enums/sendType';

const ComponentId = 'SendTypeComponent';

@Component({
    selector: 'app-send-type',
    templateUrl: 'send-type.component.html',
})
export class SendTypeComponent extends BaseSendComponent {
    groupingTitle: string;
    // State Handling
    state: any;
    private refreshTimeout: number;
    private applySavedState = true;

    constructor(sendService: SendService, i18nService: I18nService,
        platformUtilsService: PlatformUtilsService, environmentService: EnvironmentService, ngZone: NgZone,
        policyService: PolicyService, userService: UserService, searchService: SearchService,
        private popupUtils: PopupUtilsService, private stateService: StateService,
        private route: ActivatedRoute, private location: Location, private changeDetectorRef: ChangeDetectorRef,
        private broadcasterService: BroadcasterService) {
        super(sendService, i18nService, platformUtilsService, environmentService, ngZone, searchService,
            policyService, userService);
        super.onSuccessfulLoad = async () => {
            this.selectType(this.type);
        };
        this.applySavedState = (window as any).previousPopupUrl != null &&
            !(window as any).previousPopupUrl.startsWith('/send-type');
    }

    async ngOnInit() {
        // Let super class finish
        await super.ngOnInit();
        const queryParamsSub = this.route.queryParams.subscribe(async params => {
            if (this.applySavedState) {
                this.state = (await this.stateService.get<any>(ComponentId)) || {};
                if (this.state.searchText != null) {
                    this.searchText = this.state.searchText;
                }
            }

            if (params.type != null) {
                this.type = parseInt(params.type, null);
                switch (this.type) {
                    case SendType.Text:
                        this.groupingTitle = this.i18nService.t('sendTypeText');
                        break;
                    case SendType.File:
                        this.groupingTitle = this.i18nService.t('sendTypeFile');
                        break;
                    default:
                        break;
                }
                await this.load(s => s.type === this.type);
            }

            // Restore state and remove reference
            if (this.applySavedState && this.state != null) {
                window.setTimeout(() => this.popupUtils.setContentScrollY(window, this.state.scrollY), 0);
            }
            this.stateService.remove(ComponentId);

            // Unsubscribe
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });

        // Refresh Send list if sync completed in background
        this.broadcasterService.subscribe(ComponentId, (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'syncCompleted':
                        if (message.successfully) {
                            this.refreshTimeout = window.setTimeout(() => {
                                this.refresh();
                            }, 500);
                        }
                        break;
                    default:
                        break;
                }

                this.changeDetectorRef.detectChanges();
            });
        });
    }

    ngOnDestroy() {
        // Remove timeout
        if (this.refreshTimeout != null) {
            window.clearTimeout(this.refreshTimeout);
        }
        // Save state
        this.saveState();
        // Unsubscribe
        this.broadcasterService.unsubscribe(ComponentId);
    }

    async selectSend(s: SendView) {
        // TODO -> Route to edit send
    }

    async addSend() {
        // TODO -> Route to create send
    }

    back() {
        (window as any).routeDirection = 'b';
        this.location.back();
    }

    private async saveState() {
        this.state = {
            scrollY: this.popupUtils.getContentScrollY(window),
            searchText: this.searchText,
        };
        await this.stateService.save(ComponentId, this.state);
    }
}
