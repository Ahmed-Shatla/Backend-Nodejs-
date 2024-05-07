let fs = require("fs");
let express = require("express");
let moment = require('moment');

//This function reads the file if it exists or creates it if it does not exist.
function createOrRead(fileName) {
    try {
        return JSON.parse(fs.readFileSync(fileName));
    }
    catch (error) {
        fs.writeFileSync(fileName, "[]");
        return [];
    }
}

//Reading files (convert json to object)
let members = createOrRead("Members.json");
let trainers = createOrRead("Trainers.json");

let app = express();

app.use(express.json());

//Statistics APIs
app.get('/members', (req, res, next) => {
    res.send(members);
})


/*1- Get all revenues of all members.*/
app.get('/members/revenues', (req, res, next) => {
    let membersRevs = [];
    for (let i = 0; i < members.length; i++) {
        membersRevs.push(members[i].membership.cost);
    }
    res.json(membersRevs);
})

/*2- Get the revenues of a specific trainer.*/
app.get('/trainers/revenues/:id', (req, res, next) => {
    let { id } = req.params;
    let trainersRevs = [];
    //check if ID exist
    let index = trainers.findIndex((e) => e.ID == id)
    if (index == -1) {
        res.send('trainer ID not exist.');
    }
    else {
        for (let i = 0; i < members.length; i++) {
            if (members[i].trainerId == id) {
                trainersRevs.push(members[i].membership.cost);
            }
        }
        res.json(trainersRevs);
    }
})

//Member’s APIs
/*1- Add Member (must be unique) */
app.post('/members/add', (req, res, next) => {
    let newMemeber = req.body
    let index = members.findIndex((e) => e.nationalID === newMemeber.nationalID);

    if (index == -1) {
        //Increment the ID of the last added member. If there are no members, then start from the beginning.
        try {
            newMemeber.ID = members[members.length - 1].ID + 1;
        }
        catch (error) {
            newMemeber.ID = 101;
        }

        members.push(newMemeber);
        fs.writeFileSync("Members.json", JSON.stringify(members));
        res.send("New member added successfully.");
    }
    else {
        res.send("This member already exist on Database.");
    }

})

/*2- Get all Members and Member’s Trainer*/
app.get('/members/details', (req, res, next) => {
    let membersCopy = JSON.parse(JSON.stringify(members));
    for (let i = 0; i < membersCopy.length; i++) {
        let index = trainers.findIndex((e) => { return e.ID == membersCopy[i].trainerId });
        if (index != -1) { // Check if trainer exists
            delete membersCopy[i].trainerId;
            membersCopy[i].Trainer = trainers[index];
        } else {
            membersCopy[i].Trainer = null;
        }
    }
    res.json(membersCopy);
})

/*3- Get a specific Member (if his membership expired return “this member is not allowed to enter the gym”) */

app.get('/members/:id', (req, res, next) => {
    let { id } = req.params;
    let index = members.findIndex((m) => {
        return m.ID == id
    })

    if (index == -1) {
        res.send("User not found")
    }
    else {
        let expiration = new Date(members[index].membership.to);
        let today = new Date();
        today.setHours(0, 0, 0, 0);

        if (expiration >= today) {
            res.json(members[index]);
        }
        else {
            res.send("This member is not allowed to enter the gym.")
        }

    }

})

/* 4- Update Member (name, membership, trainer id) */
app.put('/members/update/:id', (req, res, next) => {
    let { id } = req.params;
    let { name, membership, trainerId } = req.body
    let index = members.findIndex((m) => {
        return m.ID == id
    })

    let tIndex = trainers.findIndex((m) => {
        return m.ID == trainerId
    })

    if (index == -1 || tIndex == -1) {
        res.send("Invalid (member or trainer) ID");
    }
    else {
        members[index].name = name;
        members[index].membership = membership;
        members[index].trainerId = trainerId;
        fs.writeFileSync("Members.json", JSON.stringify(members));
        res.send("User updated successfully.");
    }
})


/*5- Delete Member (soft delete)*/
app.delete('/members/delete/:id', (req, res, next) => {
    let { id } = req.params;
    let index = members.findIndex((m) => {
        return m.ID == id
    })

    if (index == -1) {
        res.send("Invalid member ID.");
    }
    else {
        members[index].flag = "Deleted";
        fs.writeFileSync("Members.json", JSON.stringify(members));
        res.send("User deleted successfully.");
    }
})

//Trainers APIs

app.get('/trainers',(req,res,next)=>{
    res.json(trainers);
})
/* 1- Add a trainer. */
app.post('/trainers/add', (req, res, next) => {
    let newTrainer = req.body

    //Increment the ID of the last added member. If there are no members, then start from the beginning.
    try {
        newTrainer.ID = trainers[trainers.length - 1].ID + 1;
    }
    catch (error) {
        newTrainer.ID = 1;
    }

    trainers.push(newTrainer);
    fs.writeFileSync("Trainers.json", JSON.stringify(trainers));
    res.send("New trainer added successfully.");
})

/* 2- Get all trainers and trainer’s members.*/
app.get('/trainers/members',(req,res,next)=>{
    let trainersCopy = JSON.parse(JSON.stringify(trainers));

    for (let i=0;i<trainers.length;i++){
        let membersArr = [];
        for(let j=0;j<members.length;j++){
            if(members[j].trainerId == trainers[i].ID && members[j].flag !=="Deleted"){
                membersArr.push(members[j]);
            }
        }
        trainersCopy[i].members = membersArr;
    }

    res.json(trainersCopy);
})

/* 3- Update trainer. */
app.put('/trainers/update/:id', (req, res, next) => {
    let { id } = req.params;
    let { name, duration } = req.body
    let index = trainers.findIndex((m) => {
        return m.ID == id
    })
    if (index == -1) {
        res.send("Invalid ID.");
    }
    else {
        trainers[index].name = name;
        trainers[index].duration = duration;
        fs.writeFileSync("Trainers.json", JSON.stringify(trainers));
        res.send("Trainer updated successfully.");
    }
})

/*4- Delete Member (soft delete)*/
app.delete('/trainers/delete/:id', (req, res, next) => {
    let { id } = req.params;
    let index = trainers.findIndex((m) => {
        return m.ID == id
    })

    if (index == -1) {
        res.send("Invalid trainer ID.");
    }
    else {
        trainers.splice(index,1);
        fs.writeFileSync("Trainers.json", JSON.stringify(trainers));
        res.send("Trainer deleted successfully.");
    }
})

/* 5- Get a specific trainer and trainer’s members */
app.get('/trainers/members/:id',(req,res,next)=>{
    let { id } = req.params;
    let trainersCopy = JSON.parse(JSON.stringify(trainers));

    let index = trainers.findIndex((m) => {
        return m.ID == id
    })

    if (index != -1){
        let membersArr = [];
        for(let j=0;j<members.length;j++){
            if(members[j].trainerId == trainers[index].ID && members[j].flag !=="Deleted"){
                membersArr.push(members[j]);
            }
        }
        trainersCopy[index].members = membersArr;
    }
    else{
        res.send("Invalid ID");
    }


    res.json(trainersCopy[index]);
})

app.listen(3030, () => {
    console.log("Server is running.")
})