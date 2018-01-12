let app = require('ui/modules').get('app/wazuh', []);

app.controller('rulesController', function ($scope,$q,$rootScope, Notifier, Rules,RulesAutoComplete) {
    $scope.setRulesTab = (tab) => $rootScope.globalsubmenuNavItem2 = tab;
    //Initialization
    const notify   = new Notifier({ location: 'Manager - Rules' });
    $scope.loading = true;
    $scope.rules   = Rules;
    $scope.rulesAutoComplete   = RulesAutoComplete;
    $scope.setRulesTab('rules');
    
    $scope.analizeRules = search => {
        let deferred = $q.defer();
        
        let promise;
        $scope.rulesAutoComplete.filters = [];

        if(search.startsWith('group:') && search.split('group:')[1].trim()) {
            promise = $scope.rulesAutoComplete.addFilter('group',search.split('group:')[1].trim());
        } else if(search.startsWith('level:') && search.split('level:')[1].trim()) {
            promise = $scope.rulesAutoComplete.addFilter('level',search.split('level:')[1].trim());
        } else if(search.startsWith('pci:') && search.split('pci:')[1].trim()) {
            promise = $scope.rulesAutoComplete.addFilter('pci',search.split('pci:')[1].trim());
        } else if(search.startsWith('file:') && search.split('file:')[1].trim()) {
            promise = $scope.rulesAutoComplete.addFilter('file',search.split('file:')[1].trim());
        } else {
            promise = $scope.rulesAutoComplete.addFilter('search',search);
        }

        promise
        .then(() => deferred.resolve($scope.rulesAutoComplete.items))
        .catch(error => notify.error(error));

        return deferred.promise;
    }

    $scope.checkEnter = search => {
        $scope.searchTerm = '';
        angular.element(document.querySelector('#autocomplete')).blur();
        if(search.startsWith('group:') && search.split('group:')[1].trim()) {
            $scope.rules.addFilter('group',search.split('group:')[1].trim());
        } else if(search.startsWith('level:') && search.split('level:')[1].trim()) {
            $scope.rules.addFilter('level',search.split('level:')[1].trim());
        } else if(search.startsWith('pci:') && search.split('pci:')[1].trim()) {
            $scope.rules.addFilter('pci',search.split('pci:')[1].trim());
        } else if(search.startsWith('file:') && search.split('file:')[1].trim()) {
            $scope.rules.addFilter('file',search.split('file:')[1].trim());
        }
    };


    //Load
    try {
        $scope.rules.nextPage('')
        .then(() => $scope.rulesAutoComplete.nextPage(''))
        .then(() => $scope.loading = false)
        .catch(error => notify.error(error.message));
    } catch (e) {
        notify.error('Unexpected exception loading controller');
    }

    let timesOpened = 0;
    let lastName = false;
    $scope.closeOther = name => {
        if(name !== lastName){
            lastName = name;
            timesOpened = 0;
        }
        timesOpened++;
        $scope.activeItem = (timesOpened <= 1) ? name : false;
        if(timesOpened > 1) timesOpened = 0;
        return true;
    }

    //Destroy
    $scope.$on('$destroy', () => {
        $scope.rules.reset();
        for(let h of $rootScope.ownHandlers){
            h._scope.$destroy();
        }
        $rootScope.ownHandlers = [];
    });
});

app.controller('decodersController', function ($scope,$q, $rootScope, $sce, Notifier, Decoders,DecodersAutoComplete) {
    $scope.setRulesTab = (tab) => $rootScope.globalsubmenuNavItem2 = tab;
    //Initialization
    const notify    = new Notifier({ location: 'Manager - Decoders' });
    $scope.loading  = true;
    $scope.decoders = Decoders;
    $scope.decodersAutoComplete = DecodersAutoComplete;
    $scope.typeFilter = "all";
    $scope.setRulesTab('decoders');

    const colors = [
        '#3F6833', '#967302', '#2F575E', '#99440A', '#58140C', '#052B51', '#511749', '#3F2B5B', //6
        '#508642', '#CCA300', '#447EBC', '#C15C17', '#890F02', '#0A437C', '#6D1F62', '#584477', //2
        '#629E51', '#E5AC0E', '#64B0C8', '#E0752D', '#BF1B00', '#0A50A1', '#962D82', '#614D93', //4
        '#7EB26D', '#EAB839', '#6ED0E0', '#EF843C', '#E24D42', '#1F78C1', '#BA43A9', '#705DA0', // Normal
        '#9AC48A', '#F2C96D', '#65C5DB', '#F9934E', '#EA6460', '#5195CE', '#D683CE', '#806EB7', //5
        '#B7DBAB', '#F4D598', '#70DBED', '#F9BA8F', '#F29191', '#82B5D8', '#E5A8E2', '#AEA2E0', //3
        '#E0F9D7', '#FCEACA', '#CFFAFF', '#F9E2D2', '#FCE2DE', '#BADFF4', '#F9D9F9', '#DEDAF7' //7
    ];


    let timesOpened = 0;
    let lastName = false;
    $scope.closeOther = name => {
        if(name !== lastName){
            lastName = name;
            timesOpened = 0;
        }
        timesOpened++;
        $scope.activeItem = (timesOpened <= 1) ? name : false;
        if(timesOpened > 1) timesOpened = 0;
        return true;
    }

    $scope.colorRegex = (regex) => {
        regex = regex.toString();
        let valuesArray   = regex.match(/\(((?!<\/span>).)*?\)(?!<\/span>)/gmi);
        let coloredString = regex;
        for (let i = 0, len = valuesArray.length; i < len; i++) {
            coloredString = coloredString.replace(/\(((?!<\/span>).)*?\)(?!<\/span>)/mi, '<span style="color: ' + colors[i] + ' ">' + valuesArray[i] + '</span>');
        }
        return $sce.trustAsHtml(coloredString);
    };

    $scope.colorOrder = (order) => {
        order = order.toString();
        let valuesArray   = order.split(',');
        let coloredString = order;
        for (let i = 0, len = valuesArray.length; i < len; i++) {
            coloredString = coloredString.replace(valuesArray[i], '<span style="color: ' + colors[i] + ' ">' + valuesArray[i] + '</span>');
        }
        return $sce.trustAsHtml(coloredString);
    };


    $scope.checkEnter = search => {
        $scope.searchTerm = '';
        angular.element(document.querySelector('#autocomplete')).blur();
        if(search.startsWith('path:') && search.split('path:')[1].trim()) {
            $scope.decoders.addFilter('path',search.split('path:')[1].trim());
        } else if(search.startsWith('file:') && search.split('file:')[1].trim()) {
            $scope.decoders.addFilter('file',search.split('file:')[1].trim());
        }
    };

    $scope.analizeDecoders = search => {
        let deferred = $q.defer();
        
        let promise;
        $scope.decodersAutoComplete.filters = [];

        if(search.startsWith('path:') && search.split('path:')[1].trim()) {
            promise = $scope.decodersAutoComplete.addFilter('path',search.split('path:')[1].trim());
        } else if(search.startsWith('file:') && search.split('file:')[1].trim()) {
            promise = $scope.decodersAutoComplete.addFilter('file',search.split('file:')[1].trim());
        } else {
            promise = $scope.decodersAutoComplete.addFilter('search',search);
        }

        promise
        .then(() => deferred.resolve($scope.decodersAutoComplete.items))
        .catch(error => notify.error(error));

        return deferred.promise;
    }

    //Load
    try {
        $scope.decoders.nextPage('')
        .then(() => $scope.decodersAutoComplete.nextPage())
        .then(() => $scope.loading = false)
        .catch(error => notify.error(error.message));
    } catch (e) {
        notify.error('Unexpected exception loading controller');
    }

    //Destroy
    $scope.$on("$destroy", () => {
        $scope.decoders.reset();
        for(let h of $rootScope.ownHandlers){
            h._scope.$destroy();
        }
        $rootScope.ownHandlers = [];
    });
});