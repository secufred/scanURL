var app = angular.module('App', ['ngRoute', 'appRoutes', 'MainCtrl']);

app.constant('config', {
    baseUrl: 'http://localhost:8080/'
});