'use strict'

const genericController = require('./generic')

module.exports = function (app) {
  app
    .config(['$stateProvider', ($stateProvider) => {
      $stateProvider
        .state('login', {
          url: '/login?from&returnTo',
          templateUrl: '/view/login.html',
          controllerAs: 'vm',
          title: 'Login',
          public: true,
          controller: [
            'LoginModel',
            'LoginService',
            'UserService',
            'ClientStorageService',
            '$state',
            '$window',
            '$stateParams',
            '$location',
              /**
               * @param {Login} LoginModel
               * @param {LoginService} LoginService
               * @param {UserService} UserService
               * @param {ClientStorageService} ClientStorageService
               * @param $state
               * @param $window
               * @param $stateParams
               * @param $location
               */
            (LoginModel, LoginService, UserService, ClientStorageService, $state, $window, $stateParams, $location) => {
              let vm = genericController(
                LoginModel,
                {
                  success: (result) => {
                    return UserService.get(result.sub, result)
                      .then(function (user) {
                        return ClientStorageService.set('me', user)
                      })
                      .then(() => {
                        return ClientStorageService.set('token', result)
                      })
                      .then(() => {
                        let returnTo = $stateParams.returnTo
                        if (!returnTo) {
                          returnTo = $window.localStorage.getItem('returnTo')
                          $window.localStorage.removeItem('returnTo')
                        }
                        if (returnTo) {
                          returnTo = decodeURIComponent(returnTo)
                          $location.path(returnTo.substr(2))
                          $location.search('returnTo', null)
                          $location.replace()
                        } else {
                          $state.transitionTo('dashboard')
                        }
                      })
                  }
                },
                'login',
                LoginService
              )
              vm.from = $stateParams.from
              vm.returnTo = $stateParams.returnTo
              return vm
            }]
        })
    }])
}
