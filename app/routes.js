/*
MIT License

Copyright (c) 2018 Serhan Öztekin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const SiteInfo = require("../app/models/siteInfo");
const JSON = require('circular-json');
const IPToASN = require('ip-to-asn');
const client = new IPToASN();
const extractInfoHelper = require('./extractInfoService').extractInfo;


module.exports = function(app) {
  app.post('/info', function(req, res, next) {
    const url = req.body.url;

    var p1 = new Promise(function(resolve) {
      extractInfoHelper(url, function(returnJSON, err) {

        if (err) {
          res.status(400).send(JSON.stringify(returnJSON)); //without further ado, return the error
        } else {
          siteInfo = new SiteInfo({
            img: { data: returnJSON.ss, contentType: 'image/png' },
            url: url,
            ip: returnJSON.ip,
            source: returnJSON.sourceDestination.source,
            destination: returnJSON.sourceDestination.destination
          });
          resolve(returnJSON);
          siteInfo.save(function(err, doc, num) {
            if (err) {
              console.log(err);
              //could log all the errors to database as future work.  
            }
          });
        }
      });
    });

    // This function extracts the ASN information of a given ip address(obtained by the first promise)
    //IPToASN library requires the input to be of type array, takes ip as the input from the first call.
    p1.then(function(returnJSON) {
      if ("ip" in returnJSON) {
        client.query([ip], function(err, results) {
          if (err) {
            console.error(err);
          } else {
            returnJSON["ASN"] = results[ip];
          }
          // if err, the resurnJSON won't have "ASN" field and it will be checked in the front end side, and it won't display any results.
          res.status(200).send(JSON.stringify(returnJSON));
        });
      }
    })
  });

  // frontend routes =========================================================
  // route to handle all angular requests
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });
};
