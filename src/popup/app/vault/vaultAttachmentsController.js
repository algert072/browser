angular
    .module('bit.vault')

    .controller('vaultAttachmentsController', function ($scope, $state, $stateParams, loginService, $q, toastr,
        SweetAlert, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        utilsService.initListSectionItemListeners($(document), angular);

        loginService.get($stateParams.id, function (login) {
            $q.when(login.decrypt()).then(function (model) {
                $scope.login = model;
            });
        });

        $scope.submitPromise = null;
        $scope.submit = function () {
            var files = document.getElementById('file').files;
            if (!files || !files.length) {
                toastr.error(i18nService.selectFile, i18nService.errorsOccurred);
                return;
            }

            if (files[0].size > 104857600) { // 100 MB
                toastr.error(i18nService.maxFileSize, i18nService.errorsOccurred);
                return deferred.promise;
            }

            $scope.submitPromise = $q.when(loginService.saveAttachmentWithServer($scope.login, files[0])).then(function (login) {
                $q.when(login.decrypt()).then(function (model) {
                    $scope.login = model;
                });
                $analytics.eventTrack('Added Attachment');
                toastr.success(i18nService.attachmentSaved);
            }, function (err) {
                if (err) {
                    toastr.error(err);
                }
                else {
                    toastr.error(i18nService.errorsOccurred);
                }
            });
        };

        $scope.delete = function (attachment) {
            SweetAlert.swal({
                title: i18nService.deleteAttachment,
                text: i18nService.deleteAttachmentConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.no
            }, function (confirmed) {
                if (confirmed) {
                    $q.when(loginService.deleteAttachmentWithServer($stateParams.id, attachment.id)).then(function () {
                        var index = $scope.login.attachments.indexOf(attachment);
                        if (index > -1) {
                            $scope.login.attachments.splice(index, 1);
                        }
                        $analytics.eventTrack('Deleted Attachment');
                        toastr.success(i18nService.deletedAttachment);
                    });
                }
            });
        };

        $scope.close = function () {
            $state.go('editLogin', {
                loginId: $stateParams.id,
                animation: 'out-slide-down',
                from: $stateParams.from,
                fromView: $stateParams.fromView
            });

            return;
        };
    });
