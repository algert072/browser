angular
    .module('bit.settings')

    .controller('settingsEditFolderController', function ($scope, $stateParams, folderService, toastr, $state, SweetAlert,
        utilsService, $analytics, i18nService, $timeout) {
        $timeout(function () {
            utilsService.initListSectionItemListeners(document, angular);
            document.getElementById('name').focus();
        }, 500);

        $scope.i18n = i18nService;
        $scope.folder = {};
        var folderId = $stateParams.folderId;

        folderService.get(folderId).then(function (folder) {
            return folder.decrypt();
        }).then(function (model) {
            $scope.folder = model;
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error(i18nService.nameRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.savePromise = folderService.encrypt(model).then(function (folderModel) {
                var folder = new Folder(folderModel, true);
                return folderService.saveWithServer(folder).then(function (folder) {
                    $analytics.eventTrack('Edited Folder');
                    toastr.success(i18nService.editedFolder);
                    $state.go('folders', { animation: 'out-slide-down' });
                });
            });
        };

        $scope.delete = function () {
            SweetAlert.swal({
                title: i18nService.deleteFolder,
                text: i18nService.deleteFolderConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.no
            }, function (confirmed) {
                if (confirmed) {
                    folderService.deleteWithServer(folderId).then(function () {
                        $analytics.eventTrack('Deleted Folder');
                        toastr.success(i18nService.deletedFolder);
                        $state.go('folders', {
                            animation: 'out-slide-down'
                        });
                    });
                }
            });
        };
    });
