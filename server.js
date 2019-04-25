const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongo = require("mongoose");
const app = express();
const port = process.env.PORT || 5000;

const sitelog = (message) => {
  var datetime = new Date(Date.now() + 5.5);
  fs.appendFile("ServerLog.txt", "> " + datetime.toString() + ":\n\t" + message + "\n", err => {
    if (err) console.log(err);
  }
  );
}

mongo.connect(
  "mongodb://raj:raj1@cluster0-shard-00-00-ojo88.gcp.mongodb.net:27017,cluster0-shard-00-01-ojo88.gcp.mongodb.net:27017,cluster0-shard-00-02-ojo88.gcp.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true",
  { useNewUrlParser: true },
  function (err) {
    if (err) console.log(err);
    else {
      var datetime = new Date(Date.now() + 5.5); //offset for IST
      console.log(datetime.toString() + " : connected");
      sitelog("\t\tConnected to mongoDB atlas");
    }
  }
);

var cusSchema = new mongo.Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  address: String,
  city: String,
  state: String,
  pincode: Number,
  mobile: Number,
  aadhaar: Number
});
var customer = mongo.model('customer', cusSchema);

var issueSchema = new mongo.Schema({
  complaintName: String,
  email: String,
  pay: Number,
  type: String,
  workNature: String,
  description: String,
  tstart: Date,
  tend: Date,
  status: String,
  acceptedBy: String,
  comments: [{
    name: String,
    message: String,
    time: String
  }]
});
var issue = new mongo.model('issue', issueSchema);

var freelancerSchema = new mongo.Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  address: String,
  city: String,
  state: String,
  mobile: Number,
  aadhaar: Number,
  pincode: Number,
  noOfIssues: Number,
  rating: Number,
  skills: [String]
});
var freelancer = new mongo.model('freelancer', freelancerSchema);

var organizationSchema = new mongo.Schema({
  name: String,
  email: String,
  password: String,
  headquaters: String,
  mobile: Number,
  workforce: Number,
  skills: [String]
});
var organization = new mongo.model('organization', organizationSchema);

var voterSchema = new mongo.Schema({
  issueid: String,
  email: String,
  type: String
});
var voter = new mongo.model('voter', voterSchema);

var ratingSchema = new mongo.Schema({
  issueid: String,
  cusemail: String,
  SPemail: String,
  rating: Number,
  review: String
});
var rating = new mongo.model('rating', ratingSchema);

//serve react static files.
app.use(express.static(path.join(__dirname, "client/build")));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  // console.log(req);
  res.json(req.query);
});

app.get("/logs", (req, res) => {
  console.log("log req received");
  sitelog("log access requested");
  res.sendFile(path.join(__dirname + "/ServerLog.txt"));
});

app.post("/login", (req, res) => {
  if (req.body.email === "admin@issueredressal" && req.body.password === "admin@123") {
    sitelog("Admin logged in");
    res.json({
      isAdmin: true,
      validUser: true
    });
  }
  else if (req.body.email === "ombudsman@issueredressal" && req.body.password === "ombud@123") {
    sitelog("Ombudsman logged in");
    res.json({
      isAdmin: false,
      isOmbudsman: true,
      validUser: true
    });
  }
  else {
    customer.findOne({ email: req.body.email, password: req.body.password }, function (err, data1) {
      if (data1 === null) {
        freelancer.findOne({ email: req.body.email, password: req.body.password }, function (err, data2) {
          if (data2 === null) {
            organization.findOne({ email: req.body.email, password: req.body.password }, function (err, data3) {
              if (data3 === null) {
                sitelog("Invalid sigin details { email: " + req.body.email + " }");
                res.json({
                  isCustomer: false,
                  isAdmin: false,
                  isSP: false
                });
              }
              else {
                res.json({
                  isCustomer: false,
                  isAdmin: false,
                  isSP: true
                });
              }
            })
          }
          else {
            res.json({
              isCustomer: false,
              isAdmin: false,
              isSP: true
            });
          }
        })
      }
      else {
        res.json({
          isCustomer: true,
          isAdmin: false,
          isSP: false
        });
      }
    });
  }
})

app.post("/comcard2", (req, res) => {
  var exist = 0;
  voter.countDocuments({ issueid: req.body.issueid, type: "upvote" }, function (err, count1) {
    voter.countDocuments({ issueid: req.body.issueid, type: "downvote" }, function (err, count2) {
      voter.findOne({ email: req.body.email, issueid: req.body.issueid }, function (err, data) {
        if (data == null) {
          exist = 0
        }
        else {
          exist = data.type == "upvote" ? 1 : 2
        }
        res.send({
          nou: count1,
          nod: count2,
          myv: exist
        });
      });
    });
  });
})

app.post("/comcard", (req, res) => {
  var newvoter = new voter(req.body);
  voter.findOne({ email: req.body.email, issueid: req.body.issueid }, function (err, data) {
    if (data == null) {
      newvoter.save();
      res.json({
        accepted: true
      });
    } else {
      voter.findByIdAndUpdate(data._id, { "$set": { type: req.body.type } }, err => {
        if (err) res.json({ errorStatus: true });
        else res.json({ errorStatus: false });
      });
    }
  })
})

app.post("/rating", (req, res) => {
  var newrating = new rating(req.body);
  rating.findOne({ issueid: req.body.issueid }, function (err, data) {
    if (data == null) {
      newrating.save();
      res.json({
        accepted: true
      });
    } else {
      rating.findByIdAndUpdate(data._id, { "$set": { rating: req.body.rating, review: req.body.review } }, err => {
        // if (err) res.json({ errorStatus: true });
        // else res.json({ errorStatus: false });
      });
    }
  });
  freelancer.findOne({ email: req.body.SPemail }, function (erro, datas) {
    freelancer.findByIdAndUpdate(datas._id, { "$set": { rating: ((datas.rating * datas.noOfIssues) + req.body.rating) / (datas.noOfIssues + 1), noOfIssues: datas.noOfIssues + 1 } }, err => {
      // if (erro || err) res.json({ errorStatus: true });
      // else res.json({ errorStatus: false });
    });
  });
  issue.findByIdAndUpdate(req.body.issueid, { "$set": { status: "Completed" } }, err => {
    // if (erro || err) res.json({ errorStatus: true });
    // else res.json({ errorStatus: false });
  });
})


app.post("/register", function (req, res) {
  var newcustm = new customer(req.body);
  customer.findOne({ email: req.body.email }, function (err, data) {
    if (data == null) {
      newcustm.save();
      sitelog("New Customer: { email: " + req.body.email + " }");
      res.json({
        accepted: true
      });
    } else {
      res.json({ accepted: false });
    }
  });
});

app.post("/regFreelancer", function (req, res) {
  var newFreelancer = new freelancer(req.body);
  freelancer.findOne({ email: req.body.email }, function (err, data) {
    if (data == null) {
      newFreelancer.save();
      sitelog("New Freelancer: { email: " + req.body.email + " }");
      res.json({
        accepted: true
      });
    } else {
      res.json({ accepted: false });
      sitelog("Freelancer register rejected : { email: " + req.body.email + " }");
    }
  });
});

app.post('/postcomment', function (req, res) {
  // console.log(req.body.id);
  issue.findByIdAndUpdate(req.body.id, { comments: req.body.comments }, function (err, data) {
    if (err) {
      console.log(err);
    }
    else {
      res.json({ res: "successful" });
    }
  });
});

app.post('/loadcomments', function (req, res) {
  //  console.log(req.body.issueid);
  issue.findOne({ _id: req.body.issueid }, function (err, data) {
    //  console.log(data.comments);
    res.json({ comments: data.comments });
  });
});

app.post("/regOrganization", function (req, res) {
  var newOrganization = new organization(req.body);
  organization.findOne({ email: req.body.email }, function (err, data) {
    if (data == null) {
      newOrganization.save();
      res.json({
        accepted: true
      });
    } else {
      res.json({ accepted: false });
      sitelog("Organization register rejected : { email: " + req.body.email + " }");
    }
  });
});

app.post("/postIssue", function (req, res) {
  var newissue = new issue(req.body);
  newissue.save();
  res.json({});
});

app.post("/acceptIssue", (req, res) => {
  issue.findByIdAndUpdate(req.body.id, { status: "Issue taken up by Freelancer", acceptedBy: req.body.email }, (err) => {
    if (err) {
      res.json({ errorStatus: true });
      console.log(err);
    }
    else res.json({ errorStatus: false });
  });
})

app.post('/feed', (req, res) => {
  issue.find({ email: req.body.email }, function (err, issues) {
    issue.find({ type: "Community" }, function (err, communityIssues) {
      res.send({
        myIssues: issues,
        comIssues: communityIssues
      });
    })
  })
});

app.post('/spfeed', (req, res) => {
  issue.find({ status: "Pending", type: { $ne: "Government" } }, (err, issues) => {
    issue.find({ status: "Issue taken up by Freelancer", acceptedBy: req.body.email }, (err, ai) => {
      res.json({
        allIss: issues,
        acptdIss: ai
      });
    });
  });
});

app.post("/editIssue", (req, res) => {
  let editissue = new issue(req.body);
  issue.findByIdAndUpdate(req.body.id, { "$set": { complaintName: editissue.complaintName, email: editissue.email, pay: editissue.pay, type: editissue.type, workNature: editissue.workNature, description: editissue.description, tstart: editissue.tstart, tend: editissue.tend } }, (err) => {
    if (err) {
      res.json({ errorStatus: true });
    }
    else res.json({ errorStatus: false });
  });
});

app.post('/redirectGovt', (req, res) => {
  issue.findByIdAndUpdate(req.body.id, { type: "Government" }, (err) => {
    if (err) {
      res.json({ errorStatus: true });
      console.log(err);
    }
    else res.json({ errorStatus: false });
  });
})

app.post('/admin', (req, res) => {
  if (req.body.email === "admin@issueredressal") {
    customer.find({}, function (err, customers) {
      issue.find({}, function (er, issues) {
        freelancer.find({}, function (err, freelancers) {
          organization.find({}, function (err, organizations) {
            res.json({
              allCus: customers,
              allIss: issues,
              allFreelan: freelancers,
              allOrgs: organizations
            });
          });
        });
      });
    });
  }
  else {
    res.json({});
  }
});

app.post('/dashboard2', (req, res) => {
  console.log("dashh" + new Date(req.body.date));
  issue.count({ tstart: { $gte: new Date(req.body.date) }, type: "Household" }, function (err, data1) {
    issue.count({ tstart: { $gte: new Date(req.body.date) }, type: "Community" }, function (err, data2) {
      console.log(data1);
      res.json({
        num1: data1,
        num2: data2
      });
    });
  });

  app.post('/dashboard', (req, res) => {
    if (req.body.email === "admin@issueredressal") {
      customer.countDocuments({}, function (err, customers) {
        issue.countDocuments({}, function (er, issues) {
          freelancer.countDocuments({}, function (err, freelancers) {
            organization.countDocuments({}, function (err, organizations) {
              res.json({
                noc: customers,
                noi: issues,
                nof: freelancers,
                noo: organizations
              });
            });
          });
        });
      });
    }
    else {
      res.json({});
    }
  });

  app.post("/adminDelete", (req, res) => {
    switch (req.body.documentName) {
      case "Issue":
        issue.deleteOne({ _id: req.body.id }, err => {
          if (err) res.json({ errorStatus: true });
          else res.json({ errorStatus: false });
        });
        break;
      case "Freelancer":
        freelancer.deleteOne({ _id: req.body.id }, err => {
          if (err) res.json({ errorStatus: true });
          else res.json({ errorStatus: false });
        });
        break;
      case "Organization":
        organization.deleteOne({ _id: req.body.id }, err => {
          if (err) res.json({ errorStatus: true });
          else res.json({ errorStatus: false });
        });
        break;
      case "Customer":
        customer.deleteOne({ _id: req.body.id }, err => {
          if (err) res.json({ errorStatus: true });
          else res.json({ errorStatus: false });
        });
        break;
    }
  });

  app.post('/feedDelete', (req, res) => {
    issue.deleteOne({ _id: req.body.id }, err => {
      if (err) res.json({ errorStatus: true });
      else res.json({ errorStatus: false });
    });
  });

  app.post('/Ombudsman', (req, res) => {
    if (req.body.email === "ombudsman@issueredressal") {
      issue.find({ type: "Government", status: { $nin: ["In Progress", "Completed"] } }, function (er, untracked) {
        issue.find({ type: "Government", status: "In Progress" }, function (er, tracked) {
          issue.find({ type: "Government", status: "Completed" }, function (er, completed) {
            res.json({
              trakedIssues: tracked,
              untrackedIssues: untracked,
              completedIssues: completed
            });
          });
        });
      });
    }
  })



  app.post('/ombudTrack', (req, res) => {
    issue.findByIdAndUpdate(req.body.id, { status: req.body.newStatus }, (err) => {
      if (err) {
        res.json({ errorStatus: true });
        console.log(err);
      }
      else res.json({ errorStatus: false });
    });
  })

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html'));
  });

  app.listen(port, () => {
    console.log(`server running on : "http://localhost:${port}"`);
  });
