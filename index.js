var express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const https = require("https")

var http = require("http").createServer(app);
// const httpsServer = https.createServer({
//     key: fs.readFileSync(
//       "/etc/letsencrypt/live/v12.milindsharma.com/privkey.pem"
//     ),
//     cert: fs.readFileSync(
//       "/etc/letsencrypt/live/v12.milindsharma.com/fullchain.pem"
//     ),
//   },
//   app
// );
var io = require("socket.io")(http);
const cors = require("cors");
const sequelize = require("./util/database.js");
const Sequelize = require("sequelize");

const {
  Socket
} = require("./models/socket");
const {
  Session
} = require("./models/session");

app.use(cors());
/*
    ### Middlewares
*/
//body parsing middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(express.json());

// Routing
const adminRoutes = require("./controllers/admin");
app.use("/admin", adminRoutes);
const headRoutes = require("./controllers/head");
app.use("/head", headRoutes);

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/user.html");
// });

// app.get("/admin", (req, res) => {
//   res.sendFile(__dirname + "/admin.html")
// })

// app.get("/admin", (req, res) => {
//   res.sendFile(__dirname + "/chat.html")
// })

// app.get("/socket.io/socket.io.js", (req, res) => {

//   var options = {
//     root: path.join(__dirname, '/socket.io/')
//   };
//   var fileName = 'socket.io.js';
//   res.sendFile(fileName, options, function (err) {
//     if (err) {
//       next(err);
//     } else {
//       console.log('Sent:', fileName);
//     }
//   });
// })

io.on("connection", (socket) => {
  userType = socket.handshake.query["category"];

  if (userType == "user") {
    Socket.create({
        socket: socket.id,
        category: "user",
      })
      .then((result) => {
        console.log("a user connected");
        console.log(socket.id);
        // socket.broadcast.emit("chat message", {
        //   msg: "new user added",
        //   senderid: "admin",
        // });
      })
      .catch((err) => {
        console.log(err);
      });

    socket.on("chat message", (msg) => {
      const Op = Sequelize.Op;
      console.log("none");
      if (msg.sendTo == "none") {
        console.log("if");
        Session.findOne({
            attributes: [
              [sequelize.fn("MIN", sequelize.col("connections")),
            "connections"],
              "socket",
            ],
            where: {
              connections: {
                [Op.lte]: 3,
              },
            },
          })
          .then((x) => {
            const result = x.toJSON();
            console.log(result)
            if (result.socket) {
              const connections = result.connections + 1;
              Session.update({
                connections,
              },{
                where: {
                  socket : result.socket
                }
              }).then(result2 => {
                console.log("                         *********************");
                console.log(result.socket);
                console.log("                         *********************");
                
                const newmsg = {
                  msg: msg.msg,
                  senderid: result.socket,
                  sendTo: msg.senderid
                }
                io.to(result.socket).emit("chat message", msg);
                console.log(msg.senderid);
                // io.to(msg.senderid).emit("chat message", msg);
                // io.emit("chat message", msg);
              }).catch(err2 => {
                console.log(err2)
              })
              
            } else {
              console.log("                         *********************");
              console.log("no admins available");
              console.log("                         *********************");

              // io.to(msg.senderid).emit("chat message", msg);
              io.to(msg.senderid).emit("chat message", {
                msg: "No admins available",
                senderid: "admin",
                sendTo: "none",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        console.log("else");
        io.to(msg.sendTo).emit("chat message", msg);
        io.to(msg.senderid).emit("chat message", msg);
      }

      // io.emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      Socket.destroy({
        where: {
          socket: socket.id,
        },
      });

      io.emit("chat message", {
        msg: "user left",
        senderid: "admin",
      });
    });
  } else {
    Session.create({
        socket: socket.id,
      })
      .then((result) => {
        console.log("                         *********************");
        console.log("admin connected");
        console.log("                         *********************");
      })
      .catch((err) => {
        console.log(err);
      });

    socket.on("chat message", (msg) => {
      io.to(msg.sendTo).emit("chat message", msg);
      // io.to(msg.senderid).emit("chat message", msg);
    });

    socket.on("disconnect", () => {
      Session.destroy({
          where: {
            socket: socket.id,
          },
        })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
});

sequelize
  .sync()
  .then((result) => {
    http.listen(3001);
    // httpsServer.listen(3001, (err) => {
    //   if (err) {
    //     console.log(err);
    //     throw err;
    //   } else {
    //     console.log("HTTPS Server running on port 3000");
    //   }
    // });
  })
  .catch((err) => {
    console.log(err);
  });