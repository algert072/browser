﻿angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, $stateParams, loginService, userService, toastr,
        utilsService, $analytics, i18nService) {
        utilsService.initListSectionItemListeners($(document), angular);
        $scope.i18n = i18nService;

        if ($stateParams.email) {
            $('#master-password').focus();
        }
        else {
            $('#email').focus();
        }

        $scope.model = {
            email: $stateParams.email
        };

        $scope.loginPromise = null;
        $scope.login = function (model) {
            if (!model.email) {
                toastr.error(i18nService.emailRequired, i18nService.errorsOccurred);
                return;
            }
            if (model.email.indexOf('@') === -1) {
                toastr.error(i18nService.invalidEmail, i18nService.errorsOccurred);
                return;
            }
            if (!model.masterPassword) {
                toastr.error(i18nService.masterPassRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.loginPromise = loginService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function () {
                userService.isTwoFactorAuthenticated(function (isTwoFactorAuthenticated) {
                    if (isTwoFactorAuthenticated) {
                        $analytics.eventTrack('Logged In To Two-step');
                        $state.go('twoFactor', { animation: 'in-slide-left' });
                    }
                    else {
                        $analytics.eventTrack('Logged In');
                        $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
                    }
                });
            });
        };
    });
