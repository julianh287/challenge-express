var express = require("express");
var server = express();
// var route = require('./route');
server.use(express.json());
// server.use(route);

var model = {
    clients:{},
    reset:function(){
        model.clients={};
    },
    addAppointment:function(name, appointment){
        if(!model.clients.hasOwnProperty(name)){
            model.clients[name]=[];
        }
        appointment.status='pending';
        model.clients[name].push(appointment);
        return appointment;
    },
    attend:(name, date)=>{
        model.clients[name].find(el=>{
            if(el.date===date){
                el.status='attended';
            }
        });
    },
    expire:(name, date)=>{
        model.clients[name].find(el=>{
            if(el.date===date){
                el.status='expired';
            }
        })
    },
    cancel:(name, date)=>{
        model.clients[name].find(el=>{
            if(el.date===date){
                el.status='cancelled';
            }
        })
    },
    erase:(name, date)=>{
        var erasedDate = model.clients[name].filter(el => el.date===date);
        var erasedStatus = model.clients[name].filter(el => el.status===date);
        model.clients[name] = model.clients[name].filter(el => el.date!==date);
        model.clients[name] = model.clients[name].filter(el => el.status!==date);
        if(erasedStatus){
            return erasedStatus;
        };
        if(erasedDate){
            return erasedDate;
        };
    },
    getAppointments:(name, status)=>{
        if(status){
            return model.clients[name].filter(el => el.status===status);
        }
        return model.clients[name];
    },
    getClients:()=>{
        if(model.clients){
            return Object.keys(model.clients);
        }
    }
};

server.get('/api', (req, res)=>{
    res.status(200);
    res.json(model.clients);
});

server.post('/api/Appointments', (req, res)=>{
    const body = req.body;
    if(!body.client){
        return res.status(400).send('the body must have a client property');
    };
    if(typeof body.client !=='string'){
        return res.status(400).send('client must be a string');
    };
    return res.status(200).json(model.addAppointment(body.client, body.appointment));
});

server.get('/api/Appointments/clients', (req, res)=>{
    if(model.clients){
        res.status(200)
        var listado=model.getClients();
        return res.json(listado);
    }    
})

server.get('/api/Appointments/:name', (req, res)=>{
    const client = req.params.name;
    const date = req.query.date;
    const option = req.query.option;

    if(!model.clients[client]){
        return res.status(400).send('the client does not exist');
    }
    var dateMatch = model.clients[client].find(el => el.date===date);
    if(!dateMatch){
        return res.status(400).send('the client does not have a appointment for that date');
    }
    if(! (option==='attend' || option==='expire' || option==='cancel')){
        return res.status(400).send('the option must be attend, expire or cancel');
    }
    if(option==='attend'){
        model.attend(client, date)
        return res.json(dateMatch);
    }
    if(option==='expire'){
        model.expire(client, date)
        return res.json(dateMatch);
    }
    if(option==='cancel'){
        model.cancel(client, date)
        return res.json(dateMatch);
    }
});

server.get('/api/Appointments/:name/erase', (req, res)=>{
    const client = req.params.name;
    const query = req.query;
   
    if(!model.clients[client]){
        return res.status(400).send('the client does not exist');
    }
    return res.json(model.erase(client, query.date));
});

server.get('/api/Appointments/getAppointments/:name', (req, res)=>{
    const name = req.params.name;
    const status = req.query.status;
    return res.json(model.getAppointments(name, status));
});

server.listen(3000);
module.exports = { model, server };
