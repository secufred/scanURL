var app = angular.module('App', ['ngRoute', 'appRoutes', 'MainCtrl', 'angularSpinner']);

app.constant('config', {
    baseUrl: 'http://localhost:8080/'
});