/*!
 * Copyright 2015 Inmagik SRL.
 * http://www.inmagik.com/
 *
 * ionic-color-picjer, v1.0.0
 * Flexible color picker directives for Ionic framework.
 * 
 * By @bianchimro
 *
 * Licensed under the MIT license. Please see LICENSE for more information.
 *
 */

(function(){

angular.module('ionic-modal-select', [])


.directive('compile', ['$compile', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                // when the 'compile' expression changes
                // assign it into the current DOM
                element.html(value);

                // compile the new DOM and link it to the current
                // scope.
                // NOTE: we only compile .childNodes so that
                // we don't get into infinite loop compiling ourselves
                $compile(element.contents())(scope);
            }
        );
    };
}])


.directive('modalSelect', ['$ionicModal','$timeout' ,function ($ionicModal, $timeout) {
    return {
        restrict: 'A',
        require : 'ngModel',
        //transclude : true,
        scope: { options:"=", optionGetter:"&"},
        link: function (scope, iElement, iAttrs, ngModelController, transclude) {
            
            var shortListBreak = iAttrs.shortListBreak ? parseInt(iAttrs.shortListBreak) : 10;
            
            scope.ui = {
                modalTitle : iAttrs.modalTitle || 'Pick a color',
                okButton : iAttrs.okButton || 'OK',
                hideReset : iAttrs.hideReset  !== "true" ? false : true,
                resetButton : iAttrs.okButton || 'Reset',
                cancelButton : iAttrs.cancelButton || 'Cancel',
                loadListMessage : iAttrs.loadListMessage || 'Loading',
                modalClass : iAttrs.modalClass || '',
                headerFooterClass : iAttrs.headerFooterClass || 'bar-stable',
                value  : null,
                selectedClass : iAttrs.selectedClass || 'option-selected'
            };

            //console.log(100, transclude)
            //var linkedClone = transclude();
            //console.log(angular.element(linkedClone[0]).html())
            var opt = iElement[0].querySelector('.option');
            scope.inner = angular.element(opt).html();
            opt.remove();
            
            var shortList = scope.options.length < shortListBreak;
            
            ngModelController.$render = function(){
                scope.ui.value = ngModelController.$viewValue;
            };

            var setFromProperty= iAttrs.optionProperty;
            var onOptionSelect = iAttrs.optionGetter;

            var getSelectedValue = scope.getSelectedValue = function(option){
                if(!option){
                    return null;
                }
                if(onOptionSelect){
                    var out = scope.optionGetter({option:option});
                    return out;
                }
                if(setFromProperty){
                    val = option[setFromProperty]
                } else {
                    val = option;    
                }
                return val;

            }

            scope.setOption = function(option){
                var val = getSelectedValue(option);
                ngModelController.$setViewValue(val);    
                ngModelController.$render();
                scope.closeModal();
            };

            scope.unsetValue = function(){
                $timeout(function(){
                    ngModelController.$setViewValue("");
                    ngModelController.$render();
                    scope.modal.hide();
                    scope.showList = false;
                });
            };


            scope.closeModal = function(){
                scope.modal.hide().then(function(){
                    scope.showList = false;    
                });
            };
            
            
            //loading the modal
            
            scope.modal = $ionicModal.fromTemplate(
                modalSelectTemplates['modal-template.html'],
                    { scope: scope });

            scope.$on('$destroy', function(){
                scope.modal.remove();  
            });

            iElement.on('click', function(){
                if(shortList){
                    scope.showList = true;    
                    scope.modal.show()
                } else {
                    scope.modal.show().then(function(){
                     scope.showList = true;    
                    });    
                }
            });



        }
    };
}])


})();