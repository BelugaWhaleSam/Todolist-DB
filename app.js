const express = require("express");
const bodyparser = require("body-parser");
const { redirect } = require("express/lib/response");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyparser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// let addItems = ["Cook food"];

// let workItems = [];

mongoose.connect("mongodb+srv://Admin:Admin@cluster0.xhxbn.mongodb.net/todolistDB", {useNewUrlParser: true});

//Schema
const itemsSchema = {
    name: String
};

//Mongoose Model Creates collection
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

//Schema
const listSchema = {
    name: String,
    items: [itemsSchema]
};

//Mongoose Model Creates collection
const List = mongoose.model("List", listSchema);

app.post("/", function(req,res){
 
    // console.log(req.body);

    const itemName = req.body.item;
    const listName = req.body.list; 

    const item = new Item({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList){  // search for the custom list in collection 
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
}); 

app.get("/", function(req, res){
    // res.send("Server is up and running");
    // let day = date.getDate();

    Item.find({}, function(err, foundItems){  

        if(foundItems.length === 0) {  // If already the items are in the foundItems array in database we do not insert it again
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Successfuly saved deafult items to DB ");
                    res.redirect("/");  //since it instantly doesnt show the items we go again to route page to refresh
            }
});
}
        // console.log(foundItems);
        res.render("list",{listTitle: "Today", newItem: foundItems});
    });
      // Key: value

});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.check;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("successfuly deleted checked item");
                res.redirect("/");
            }
       });
    } else {
         List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
             if(!err) {
                 res.redirect("/"+listName);
             }
         })
    }

});

app.get("/:random", function(req, res){
    
    const keyword = _.capitalize(req.params.random);

    List.findOne({name: keyword}, function(err, foundList){
        if(!err){
            if(!foundList){
                // Create a new list
                const list = new List({
                    name: keyword,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + keyword); // When we create a new list we also need ot redirect ourselves to it
            } else {
                // Show an existing list
                res.render("list", {listTitle: foundList.name, newItem: foundList.items});
            }
        }
    });
});

app.get("/aboutme", function(req, res){
    res.render("aboutme");
});

app.listen(process.env.PORT || 5000, function(){
    console.log("Server running on port 5000");
});