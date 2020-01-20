var express = require('express');
var router = express.Router();
var _ = require('underscore');
const exampleRequests = [
  {
    clientId: 1,
    requestId: 'abc',
    hours: 6
  },
  {
    clientId: 1,
    requestId: 'def',
    hours: 4
  },
  {
    clientId: 1,
    requestId: 'zzz',
    hours: 2
  },
  {
    clientId: 2,
    requestId: 'ghi',
    hours: 1
  }  
]

const exampleReturnValue = {
  butlers: [
      {
          requests: ['abc', 'zzz']
      },
      {
          requests: ['def','ghi']
      }
  ],
  spreadClientIds: [1,2]
}
let total = exampleRequests.length;
let assigned = 0;
let butlers = [];
let consumedHours = [];

function allocateAndReport(requests) {
  let req = _.sortBy(requests, 'clientId' );
  assignButler(req);
  
  //let req = _.sortBy(stooges, 'clientId');
}


/**
 * Assigning bulter
 * @param {object} requests 
 */
function assignButler(requests){
  let canAssign = 0; 
  let sameClient = true; 
  let clientIds = [];
  req_copy = requests; 
  // Iterate until all request assigned.
  while(total > assigned){    
    canAssign = 0;
    // iterate ever request
    _.map(requests,function(req,index){
      if(req && !req.completed){
        if(butlers.length == 0){          
          consumedHours.push({ hours:req.hours,clientId:req.clientId });
          clientIds.push(req.clientId);
          butlers.push( {
            requests:[req.requestId]
          });
          assigned++;
          requests[index].completed = true;       
        } else {
          //check if client already exist and have space to accomodate
          let client = _.find(consumedHours,{clientId:req.clientId});
          if(client){
            if(client.hours < 8 && +client.hours + +req.hours <= 8){
              if(canAssign == 0){
                canAssign = index;
              }else{               
                let diff = 8 - ( +client.hours ) ;                
                if(diff <  +req.hours){
                  canAssign = index;
                }
              }              
            }else{
              consumedHours.push({hours:req.hours,clientId:req.clientId});
              clientIds.push(req.clientId);
              butlers.push({
                requests:[req.requestId]
              });
              requests[index].completed = true; 
              assigned++;            
            }   
            // if canAssign have any value       
          } else if(canAssign == 0) {  
            let inserted = false;  
            _.map(butlers,function(b,ind){   
              let thisHours = 0;           
              _.map(b.requests,function(rs){
                let request = _.find(requests,{requestId:rs});
                thisHours += request.hours;
              });
              if(thisHours < 8 && (8 - thisHours) >= req.hours){
                inserted = true;
                //console.log(butlers,index,)
                butlers[ind]['requests'].push(requests[index].requestId);
                requests[index].completed = true; 
                assigned++; 
              }
            });
            if(!inserted){              
              consumedHours.push({hours:req.hours,clientId:req.clientId});
              clientIds.push(req.clientId);
              butlers.push({
                requests:[req.requestId]
              });
              requests[index].completed = true; 
              assigned++;               
            }                   
          }
        }      
      }      
    });   
    if (canAssign){
      let index =  clientIds.indexOf(requests[canAssign].clientId);
      //console.log(butlers,index,)
      let d = butlers[index]['requests'];
      let c = ['d']; 
      let requestId = requests[canAssign].requestId;
      requests[canAssign].completed = true; 
      d.push(requestId)
      butlers[index]['requests'] = d;
      assigned++; 
    }      
  };  
  console.log(butlers);
}
/* GET home page. */
router.get('/', function(req, res, next) {
  allocateAndReport(exampleRequests);
  res.render('index', { title: 'Express' });
  
});

module.exports = router;
