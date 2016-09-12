﻿angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, siteService, folderService, $q, cipherService, $state, $stateParams) {
        var delayLoad = true;
        if (!$rootScope.vaultSites) {
            $rootScope.vaultSites = [];
            delayLoad = false;
        }
        if (!$rootScope.vaultFolders) {
            $rootScope.vaultFolders = [];
            delayLoad = false;
        }

        if (delayLoad) {
            setTimeout(setScrollY, 100);
            setTimeout(loadVault, 1000);
        }
        else {
            loadVault();
        }

        function loadVault() {
            var promises = [];
            var decSites = [];
            var decFolders = [{
                id: null,
                name: '(none)'
            }];

            folderService.getAll(function (folders) {
                siteService.getAll(function (sites) {
                    for (var i = 1; i < folders.length; i++) {
                        decFolders.push({
                            id: folders[i].id
                        });

                        var folderNamePromise = cipherService.decrypt(folders[i].name, i);
                        promises.push(folderNamePromise);
                        folderNamePromise.then(function (obj) {
                            decFolders[obj.index].name = obj.val;
                        });
                    }

                    for (var j = 0; j < sites.length; j++) {
                        decSites.push({
                            id: sites[j].id,
                            folderId: sites[j].folderId,
                            favorite: sites[j].favorite
                        });

                        var namePromise = cipherService.decrypt(sites[j].name, j);
                        promises.push(namePromise);
                        namePromise.then(function (obj) {
                            decSites[obj.index].name = obj.val;
                        });

                        var usernamePromise = cipherService.decrypt(sites[j].username, j);
                        promises.push(usernamePromise);
                        usernamePromise.then(function (obj) {
                            decSites[obj.index].username = obj.val;
                        });
                    }

                    $q.all(promises).then(function () {
                        $rootScope.vaultSites = decSites;
                        $rootScope.vaultFolders = decFolders;
                        if (!delayLoad) {
                            setScrollY();
                        }
                    });
                });
            });
        }

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.addSite = function () {
            $state.go('addSite', {
                animation: 'in-slide-up',
                returnScrollY: getScrollY()
            });
        };

        $scope.viewSite = function (site) {
            $state.go('viewSite', {
                siteId: site.id,
                animation: 'in-slide-up',
                returnScrollY: getScrollY()
            });
        };

        function getScrollY() {
            var content = document.getElementsByClassName('content')[0];
            return content.scrollTop;
        };

        function setScrollY() {
            if ($stateParams.scrollY) {
                var content = document.getElementsByClassName('content')[0];
                content.scrollTop = $stateParams.scrollY;
            }
        };
    });
