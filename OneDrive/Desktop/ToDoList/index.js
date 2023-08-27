import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import {dirname} from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {Schema} from "mongoose";
import pkg from 'lodash';
const { capitalize, map } = pkg;
const __dirname=dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5000;
let page ="";
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new Schema({
    name: String,
  });

const listSchema = new Schema({
    name:String,
    items:[itemSchema]
}) 


const Item =mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listSchema);

const item1=new Item({
    name:"This is your own ToDoList"
})
const item2=new Item({
    name:"Press + to Add a new item"
})
const item3=new Item({
    name:"Hit <--- to Delete an item"
})
const defaultItems=[item1,item2,item3];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    async function find(){
        const results=await Item.find({},"name").exec();
        if(results.length === 0)
        {
            async function add(){
                await Item.insertMany([item1,item2,item3]);
            }
            add().catch((err)=>console.log(err));
        }
        res.render("partials/item.ejs",{listTitle:"Today",tasks:results});
    }
    find().catch((err)=>console.log(err));
    
})

app.post("/submit",async(req,res)=>{
    try{
    const itemvalue = req.body.itemvalue;
    const listName = req.body.listName;
    const newItem = new Item({
        name:itemvalue
    })
    if(listName==="Today"){
        newItem.save();
        res.redirect("/");
    }
    else{
        const resultList = await List.findOne({name:listName}).exec();
        resultList.items.push(newItem);
        resultList.save();
        res.redirect("/"+listName);
    }}
    catch(err){
        console.log(err);
    }

})
 
app.post("/delete",async(req,res)=>{
    const listName=req.body.listName;
    const itemID =req.body.buttonvalue;
    try{
    if(listName==="Today"){
        await Item.deleteOne({_id:itemID});
        res.redirect("/");
    }
    else{
        const result=await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemID}}});
        res.redirect("/"+listName);
    }
   }
   catch(err)
   {
      console.log(err);
   }
 
})

app.get("/:customListName",async(req,res)=>{
    try{
        const ListName = capitalize(req.params.customListName);
    const foundItem =await List.findOne({name:ListName}).exec();
    if(!(foundItem)){
        const listItem =new List({
            name:ListName,
            items:defaultItems
        })
        listItem.save();
       res.redirect("/"+ListName);
    }
    else{

    res.render("partials/item.ejs",{listTitle:foundItem.name ,tasks:foundItem.items});}
   }
   catch(err){
    console.log(err);
   }
})


app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];