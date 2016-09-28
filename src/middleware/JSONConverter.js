/*
Use this functions to convert a Javascript Object to a JSONAPI conform format.
Convert a single Object with the convertJSONObject.
Convert an array Object with the convertJSONArry.
Method returns an error if fields are not set correctly
 */
'use strict';
const JSONConverter = {
  convertJSONObject: function _jsonObje(type, attribute) {
    if (type === undefined || attribute === undefined) return { errors: { msg: 'type or attribute of JSONConverter not set' } };

    let stringJSON = JSON.stringify(attribute);
    stringJSON = stringJSON.replace(/_id/g, 'id');


    const returnObject = {};
    returnObject[type] = JSON.parse(stringJSON);
    return returnObject;
  },
  convertJSONArray: function _jsonArr(type, attribute) {
    if (type === undefined || attribute === undefined) return { errors: { msg: 'type or attribute of JSONConverter not set' } };
    const dataArray = [];
    attribute.forEach((item) => {
      let stringJSON = JSON.stringify(item);
      stringJSON = stringJSON.replace(/_id/g, 'id');

      dataArray.push(JSON.parse(stringJSON));
    });
    return { [type]: dataArray };
  },

  // Wrapps an error message to a RESTAdapter friendly Javascript Object. User res.json(JSONConverter.convertJSONError(msg)) to send an error back.
  convertJSONError: function _jsonErr(message, status = 500) {
    return { errors: { msg: message, status } };
  },
};

module.exports = JSONConverter;
