"use strict";

app.factory('IdGeneratorService', function() {
  var IdGeneratorService = {};

  IdGeneratorService.buildGenerator = function() {
    var nextId = 0;

    return {
      next: function() {
        nextId++;

        return nextId;  
      },
   };
  };

  return IdGeneratorService;
});
