// CCCS-425-754 Final Project Part 2
// Submitted by Marc Léonard

const express = require("express");
const app = express();

let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

const cors = require("cors");
app.use(cors());

let morgan = require("morgan");
app.use(morgan("combine"));

// Required as per teacher for sourcecode extraction
app.get("/sourcecode", (req, res) => {
  res.send(
    require("fs")
      .readFileSync(__filename)
      .toString()
  );
});

var usernames = [""];
var passwords = [""];
var tokens = [""];
var listings = [
  {
    price: 0,
    description: "desc-test",
    itemId: "itemId-test",
    sellerUsername: "username-test",
    available: Boolean(true),
    status: "Item not sold"
  }
];
var carts = [""];
var purchased = [
  {
    itemId: "itemId",
    username: "username"
  }
];
var chats = [
  {
    from: "from",
    to: "to",
    contents: "contents"
  }
];
var reviews = [
  {
    numStars: 0,
    contents: "n/a",
    itemid: "xxxxxxx",
    from: "buyer",
    to: "seller"
  }
];

app.post("/signup", (req, res) => {
  console.log("request to /signup received");

  // const ip = req.headers["x-forwarded-for"].split(",")[0];
  // console.log("IP: ", ip);

  let creds = JSON.parse(req.body);
  // console.log(creds);
  // console.log("Username is " + creds.username);
  // console.log("Password is " + creds.password);

  if (creds.username === null || creds.username === undefined) {
    res.status(200).send({ success: false, reason: "username field missing" });
  } else if (creds.password === null || creds.password === undefined) {
    res.status(200).send({ success: false, reason: "password field missing" });
  } else {
    if (usernames.includes(creds.username)) {
      res.status(200).send({ success: false, reason: "Username exists" });
    } else {
      // console.log("adding to arrays");
      usernames.push(creds.username);
      passwords.push(creds.password);
      tokens.push("");
      res.status(200).send({ success: true });
    }
  }
});

app.post("/login", (req, res) => {
  console.log("request to /login received");

  let creds = JSON.parse(req.body);
  // console.log("username: ", creds.username);
  // console.log("Password: ", creds.password);
  if (creds.username === null || creds.username === undefined) {
    res.status(200).send({ success: false, reason: "username field missing" });
  } else if (creds.password === null || creds.password === undefined) {
    res.status(200).send({ success: false, reason: "password field missing" });
  } else {
    if (usernames.includes(creds.username)) {
      var i = usernames.indexOf(creds.username);
      if (creds.password === passwords[i]) {
        // Create token... revisit, make this a function? ------------------
        var randomtoken = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";
        for (var r = 0; r < 7; r++) {
          randomtoken += possible.charAt(
            Math.floor(Math.random() * possible.length)
          );
        }
        // insert token at specific index of array
        tokens[i] = randomtoken;
        res.status(200).send({ success: true, token: randomtoken });
      } else {
        res.status(200).send({ success: false, reason: "Invalid password" });
      }
    } else {
      // console.log("username not found");
      res.status(200).send({ success: false, reason: "User does not exist" });
    }
  }
});

app.post("/change-password", (req, res) => {
  console.log("request to /change-password received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("oldPassword: " + name.oldPassword);
  // console.log("newPassword: " + name.newPassword);

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      var i = tokens.indexOf(token);
      if (name.oldPassword === passwords[i]) {
        passwords[i] = name.newPassword;

        res.status(200).send({ success: true });
      } else {
        res
          .status(200)
          .send({ success: false, reason: "Unable to authenticate" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/create-listing", (req, res) => {
  console.log("request to /create-listing received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("price: " + name.price);
  // console.log("description: " + name.description);

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      var i = tokens.indexOf(token);
      if (name.price === null || name.price === undefined) {
        res.status(200).send({ success: false, reason: "price field missing" });
      } else if (name.description === null || name.description === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "description field missing" });
      } else {
        // create listingId

        var listingId = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";
        for (var r = 0; r < 7; r++) {
          listingId += possible.charAt(
            Math.floor(Math.random() * possible.length)
          );
        }

        // create listing
        var listing = {
          price: name.price,
          description: name.description,
          itemId: listingId,
          sellerUsername: usernames[i],
          available: Boolean(true),
          status: "Item not sold"
        };
        // console.log("listing: ", listing);
        // console.log("listings: ", listings);
        listings.push(listing);

        res.status(200).send({ success: true, listingId: listingId });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/listing", (req, res) => {
  console.log("request to /listing received");
  // console.log("req.query.listingId: ", req.query.listingId);

  if (req.query.listingId === null || req.query.listingId === undefined) {
    res.status(200).send({ success: false, reason: "listingId field missing" });
  } else {
    var listing = new Array(0);
    Object.keys(listings).forEach(function(key) {
      if (req.query.listingId === listings[key].itemId) {
        var item = {
          price: listings[key].price,
          description: listings[key].description,
          itemId: listings[key].itemId,
          sellerUsername: listings[key].sellerUsername
        };
        listing.push(item);
        // console.log("item in forEach: ", item);
      }
    });
    if (listing.length !== 0) {
      res.status(200).send({ success: true, listing: listing[0] });
    } else {
      res.status(200).send({ success: false, reason: "Invalid listing id" });
      // console.log("item invalid branch: ", item);
    }
  }
});

app.post("/modify-listing", (req, res) => {
  console.log("request to /modify-listing received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("price: " + name.price);
  // console.log("description: " + name.description);

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      // var i = tokens.indexOf(token);

      if (name.itemid === null || name.itemid === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "itemid field missing" });
      } else {
        // console.log("name.itemid present branch")
        // console.log("name.price: ", name.price)
        // console.log("name.description: ", name.description)
        var change_check = 0;
        if (name.price) {
          // console.log("modifying name.price branch");
          Object.keys(listings).forEach(function(key) {
            if (name.itemid === listings[key].itemId) {
              var item = {
                price: name.price,
                description: listings[key].description,
                itemId: listings[key].itemId,
                sellerUsername: listings[key].sellerUsername,
                available: listings[key].available,
                status: listings[key].status
              };
              listings[key] = item;
              // console.log("Modifying price branch: ", listings[key]);
              change_check++;
            }
          });
        } else if (name.description) {
          // console.log("modifying name.description branch");
          Object.keys(listings).forEach(function(key) {
            if (name.itemid === listings[key].itemId) {
              var item = {
                price: listings[key].price,
                description: name.description,
                itemId: listings[key].itemId,
                sellerUsername: listings[key].sellerUsername,
                available: listings[key].available,
                status: listings[key].status
              };
              listings[key] = item;
              // console.log("Modifying description branch: ", listings[key]);
              change_check++;
            }
          });
        }
        if (change_check > 0) {
          res.status(200).send({ success: true });
        } else {
          res
            .status(200)
            .send({ success: false, reason: "no changes applied" });
        }
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/add-to-cart", (req, res) => {
  console.log("request to /add-to-cart received");

  let token = req.headers.token;
  let name = JSON.parse(req.body);

  // console.log("token: " + token);
  // console.log("price: " + name.itemid);

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      if (name.itemid === null || name.itemid === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "itemid field missing" });
      } else {
        var cart_check = 0;
        Object.keys(listings).forEach(function(key) {
          if (name.itemid === listings[key].itemId) {
            var i = tokens.indexOf(token);
            var cart = { username: usernames[i], itemId: name.itemid };
            carts.push(cart);
            // console.log(cart);
            cart_check++;
          }
        });
        if (cart_check > 0) {
          res.status(200).send({ success: true });
        } else {
          res.status(200).send({ success: false, reason: "Item not found" });
        }
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/cart", (req, res) => {
  console.log("request to /cart received");

  let token = req.headers.token;

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      var i = tokens.indexOf(token);
      var cart = new Array(0);
      Object.keys(carts).forEach(function(key) {
        // console.log("starting for each - username: ", carts[key].username)
        // console.log("starting for each - itemId: ", carts[key].itemId)
        if (usernames[i] === carts[key].username) {
          // console.log("carts[key].itemid: ", carts[key].itemid);
          var y = carts[key].itemId;
          Object.keys(listings).forEach(function(key) {
            if (y === listings[key].itemId) {
              // var items = listings[key];
              // var items = (listings[key].price, listings[key].description, listings[key].itemId, listings[key].sellerUsername);
              var items = {
                price: listings[key].price,
                description: listings[key].description,
                itemId: listings[key].itemId,
                sellerUsername: listings[key].sellerUsername
              };
              cart.push(items);
            }
          });
        }
      });
      res.status(200).send({ success: true, cart: cart });
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/checkout", (req, res) => {
  console.log("request to /checkout received");

  let token = req.headers.token;
  let item_count = 0;
  let item_missing = 0;

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      var i = tokens.indexOf(token);
      // var item_count = 0;
      // var item_missing = 0
      Object.keys(carts).forEach(function(key) {
        if (usernames[i] === carts[key].username) {
          item_count++;
        }
      });
      // console.log("item_count: ", item_count)
      if (item_count > 0) {
        // var item_missing = 0;
        Object.keys(carts).forEach(function(key) {
          if (usernames[i] === carts[key].username) {
            Object.keys(listings).forEach(function(item) {
              if (
                listings[item].itemId === carts[key].itemId &&
                !listings[item].available
              ) {
                item_missing++;
              }
            });
          }
        });
        // console.log("item_missing count: ", item_missing)
        if (item_missing > 0) {
          res.status(200).send({
            success: false,
            reason: "Item in cart no longer available"
          });
        } else {
          // cleanup listings & creating purchase history -----------------------------------------------------------
          var history = new Array(0);
          Object.keys(carts).forEach(function(key) {
            if (usernames[i] === carts[key].username) {
              Object.keys(listings).forEach(function(item) {
                if (listings[item].itemId === carts[key].itemId) {
                  listings[item].available = Boolean(false);
                  listings[item].status = "not-shipped";
                  var items = {
                    itemId: listings[item].itemId,
                    username: usernames[i]
                  };
                  purchased.push(items);
                  // console.log("purchasing items:", items)
                }
              });
            }
          });
          res.status(200).send({ success: true });
        }
      } else {
        res.status(200).send({ success: false, reason: "Empty cart" });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/purchase-history", (req, res) => {
  console.log("request to /purchase-history received");

  let token = req.headers.token;

  // console.log("all purchased: ", purchased)
  // console.log("token: ", token);

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      var i = tokens.indexOf(token);

      // console.log("index of token: ", i)
      // console.log("username at that index: ", usernames[i]);

      var history = new Array(0);

      Object.keys(purchased).forEach(function(key) {
        // console.log("purchased[key].username: ", purchased[key].username)
        if (usernames[i] === purchased[key].username) {
          // console.log("purchased branch ------------------------------------------ ")
          Object.keys(listings).forEach(function(item) {
            if (purchased[key].itemId === listings[item].itemId) {
              var items = {
                price: listings[item].price,
                description: listings[item].description,
                itemId: listings[item].itemId,
                sellerUsername: listings[item].sellerUsername
              };
              // console.log("items: ", items)
              history.push(items);
            }
          });
        }
      });
      res.status(200).send({ success: true, purchased: history });
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/chat", (req, res) => {
  console.log("request to /chat received");

  let token = req.headers.token;

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      let name = JSON.parse(req.body);
      // console.log("name.destination: " + name.destination);
      // console.log("name.contents: " + name.contents);
      if (name.destination === null || name.destination === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "destination field missing" });
      } else if (name.contents === null || name.contents === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "contents field missing" });
      } else {
        if (usernames.includes(name.destination)) {
          var i = tokens.indexOf(token);
          var chat = {
            from: usernames[i],
            to: name.destination,
            contents: name.contents
          };
          // console.log("chat: ", chat)
          // console.log("all chats before: ", chats)
          chats.push(chat);
          // console.log("all chats after: ", chats)
          res.status(200).send({ success: true });
        } else {
          res.status(200).send({
            success: false,
            reason: "Destination user does not exist"
          });
        }
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/chat-messages", (req, res) => {
  console.log("request to /chat-messages received");

  let token = req.headers.token;

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      let name = JSON.parse(req.body);
      // console.log("name.destination: " + name.destination);
      // console.log("name.contents: " + name.contents);
      if (name.destination === null || name.destination === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "destination field missing" });
      } else {
        if (usernames.includes(name.destination)) {
          // fetch messages
          var i = tokens.indexOf(token);
          var messages = new Array(0);

          Object.keys(chats).forEach(function(key) {
            if (
              chats[key].from === usernames[i] ||
              chats[key].to === usernames[i]
            ) {
              var msg = {
                from: chats[key].from,
                contents: chats[key].contents
              };
              messages.push(msg);
            }
          });

          res.status(200).send({ success: true, messages: messages });
        } else {
          res.status(200).send({
            success: false,
            reason: "Destination user not found"
          });
        }
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.post("/ship", (req, res) => {
  console.log("request to /ship received");

  let token = req.headers.token;

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      let name = JSON.parse(req.body);
      if (name.itemid === null || name.itemid === undefined) {
        res
          .status(200)
          .send({ success: false, reason: "itemid field missing" });
      } else {
        var i = tokens.indexOf(token);
        Object.keys(listings).forEach(function(key) {
          if (name.itemid === listings[key].itemId) {
            if (listings[key].sellerUsername !== usernames[i]) {
              res.status(200).send({
                success: false,
                reason: "User is not selling that item"
              });
            } else {
              if (listings[key].available === true) {
                res
                  .status(200)
                  .send({ success: false, reason: "Item was not sold" });
              } else {
                if (listings[key].status === "shipped") {
                  res.status(200).send({
                    success: false,
                    reason: "Item has already shipped"
                  });
                } else {
                  var item = {
                    price: listings[key].price,
                    description: listings[key].description,
                    itemId: listings[key].itemId,
                    sellerUsername: listings[key].sellerUsername,
                    available: listings[key].available,
                    status: "shipped"
                  };
                  listings[key] = item;
                  res.status(200).send({ success: true });
                }
              }
            }
          }
        });
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/status", (req, res) => {
  console.log("request to /status received");
  // console.log("req.query.itemid: ", req.query.itemid);
  if (req.query.itemid === null || req.query.itemid === undefined) {
    res.status(200).send({ success: false, reason: "itemId field missing" });
  } else {
    Object.keys(listings).forEach(function(key) {
      if (req.query.itemid === listings[key].itemId) {
        if (listings[key].available === true) {
          res.status(200).send({ success: false, reason: "Item not sold" });
        } else if (listings[key].status === "shipped") {
          res.status(200).send({ success: true, status: "shipped" });
        } else {
          res.status(200).send({ success: true, status: "not-shipped" });
        }
      }
    });
  }
});

app.post("/review-seller", (req, res) => {
  console.log("request to /review-seller received");

  let token = req.headers.token;

  if (token === null || token === undefined) {
    res.status(200).send({ success: false, reason: "token field missing" });
  } else {
    if (tokens.includes(token)) {
      let name = JSON.parse(req.body);
      // console.log("name.numStars: " + name.numStars);
      // console.log("name.contents: " + name.contents);
      // console.log("name.itemid: " + name.itemid);
      var i = tokens.indexOf(token);
      var itemfound = 0;
      var reviewed = 0;
      var seller = "someone";
      var review = {
        numStars: 0,
        contents: "blablabla",
        itemid: "xxxxxx",
        from: "buyer",
        to: "seller"
      };

      Object.keys(reviews).forEach(function(key) {
        console.log("reviewed: ", reviewed);
        console.log("reviews[key].itemid: ", reviews[key].itemid);
        console.log("name.itemid: ", name.itemid);
        if (reviews[key].itemid === name.itemid) {
          reviewed++;
        }
      });

      if (reviewed > 0) {
        res.status(200).send({
          success: false,
          reason: "This transaction was already reviewed"
        });
      } else {
        Object.keys(purchased).forEach(function(key) {
          // console.log("purchased[key].itemId: " + purchased[key].itemId);
          // console.log("purchased[key].username: " + purchased[key].username);
          // console.log("name.itemid: " + name.itemid);
          // console.log("usernames[i]: " + usernames[i]);
          if (
            purchased[key].itemId === name.itemid &&
            purchased[key].username === usernames[i]
          ) {
            itemfound++;
          }
        });
        if (itemfound === 1) {
          Object.keys(listings).forEach(function(key) {
            if (listings[key].itemId === name.itemid) {
              seller = listings[key].sellerUsername;
              console.log("seller: ", seller);
            }
          });
          var review = {
            numStars: name.numStars,
            contents: name.contents,
            itemid: name.itemid,
            from: usernames[i],
            to: seller
          };
          reviews.push(review);
          res.status(200).send({ success: true });
        } else {
          res.status(200).send({
            success: false,
            reason: "User has not purchased this item"
          });
        }
      }
    } else {
      res.status(200).send({ success: false, reason: "Invalid token" });
    }
  }
});

app.get("/reviews", (req, res) => {
  console.log("request to /reviews received");
  // console.log("req.query.sellerUsername: ", req.query.itemisellerUsernamed);
  if (
    req.query.sellerUsername === null ||
    req.query.sellerUsername === undefined
  ) {
    res
      .status(200)
      .send({ success: false, reason: "sellerUsername field missing" });
  } else {
    var allreviews = new Array(0);
    Object.keys(reviews).forEach(function(key) {
      if (req.query.sellerUsername === reviews[key].to) {
        var singlereview = {
          from: reviews[key].from,
          numStars: reviews[key].numStars,
          contents: reviews[key].contents
        };
        allreviews.push(singlereview);
      }
    });
    res.status(200).send({ success: true, reviews: allreviews });
  }
});


app.get("/selling", (req, res) => {
  console.log("request to /selling received");
  // console.log("req.query.sellerUsername: ", req.query.itemisellerUsernamed);
  if (
    req.query.sellerUsername === null ||
    req.query.sellerUsername === undefined
  ) {
    res
      .status(200)
      .send({ success: false, reason: "sellerUsername field missing" });
  } else {
    var allselling = new Array(0);
    Object.keys(listings).forEach(function(key) {
      if (req.query.sellerUsername === listings[key].sellerUsername) {
        var singleselling = {
          price: listings[key].price,
          description: listings[key].description,
          itemId: listings[key].itemId,
          sellerUsername: listings[key].sellerUsername
        };
        allselling.push(singleselling);
      }
    });
    res.status(200).send({ success: true, selling: allselling });
  }
});


app.listen(process.env.PORT || 3000)

// listen for requests :)
// const listener = app.listen(process.env.PORT, () => {
//  console.log("Your app is listening on port " + listener.address().port);
// });
