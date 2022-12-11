const express = require('express');
const bodyparser = require('body-parser');  // to take the form data without this we will be unable to find
const mongoose = require('mongoose');   // this is a database for mongoose
const dotenv = require('dotenv');

const app = express();


dotenv.config();

const PORT = process.env.PORT || 3000


const db = process.env.DATABASE;

app.use(express.static('public'));  // telling node to use public as a static folder
app.use(bodyparser.urlencoded({extended:true}))  // imp for form 


mongoose.set('strictQuery', true);   // mongoose will not connect that's why it is


// app.use()s
app.set('view engine', 'ejs');    // this is for ejs to use templating method




//DEPLOYMENT CONNECTION FOR DATABASE


const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }



mongoose.connect(db,{useNewUrlParser: true});  // connecting mongoose

const itemSchema = ({                                       // this is the schema for mongoose database
    item: String,
})

const listSchema = ({
    name:String,
    item:[itemSchema]
})


const Item = mongoose.model('item',itemSchema);         // this is a model and item is collection
const List = mongoose.model('list',listSchema);

const item1 = new Item ({
    item:'welcome'
})
const item2 = new Item ({
    item:'<-- check item to delete'
})

const defaultItemList = [item1,item2];




app.get('/',(req,res)=>{
    // res.sendFile( "index.html");

    Item.find({},(err,foundItems)=>{           // finding data from our database
        if(err){
            console.log(err);
        }
        else{
            if(foundItems.length===0){
                // defaultItemList.save()
                Item.insertMany(defaultItemList,function(err){
                    if(err){
                        console.log(err);
                    }
                })
            
                List.find({},function(err,foundList){
                    if(!err){
                        res.render('index',{listType:'Today',itemList:foundItems,navbarItem:foundList})
                    }
                })
            }
            else{
                List.find({},function(err,foundList){
                    if(!err){
                        res.render('index',{listType:'Today',itemList:foundItems,navbarItem:foundList})
                    }
                })
            }
        }
    });


})
app.post('/',(req,res)=>{
    const newItem = req.body.listItem;    // getting form data 
    const listType = req.body.listType;    // getting form data 
    const item = new Item ({
        item:newItem
    });

    if(listType==='Today'){
        item.save()
        res.redirect('/')
    } 
    else{
        List.findOne({name:listType},function(err,foundList){
            foundList.item.push(item);
            foundList.save()
            res.redirect('/'+ listType)
        })
    }

    


})


app.get('/:customeList',(req,res)=>{                // this is a dynamic route 
    const customeList = req.params.customeList;
    List.findOne({name:customeList},function(err,foundList){            // finding data to check it is or not 
        if(!err){
            if(!foundList){
                if (customeList==='favicon.ico') {                  // favicon is coming on refreshing the page that why it is
                    res.redirect('/')
                }
                
                else if (customeList==='list-type'){                // so that we can render the form for taking list type
                    List.find({},function(err,navList){
                        if(!err){
                            res.render('customeform',{navbarItem:navList})
                        }
                    })
                }
                else if (customeList==='about-us'){                // so that we can render the form for taking list type
                    List.find({},function(err,navList){
                        if(!err){
                            res.render('about',{navbarItem:navList})
                        }
                    })
                }
                else if (customeList==='how-to-use'){                // so that we can render the form for taking list type
                    List.find({},function(err,navList){
                        if(!err){
                            res.render('uses',{navbarItem:navList})
                        }
                    })
                }
                else{
                    const item = new List ({
                        name:customeList,
                        item:defaultItemList,
                    });
                    item.save()
                    res.redirect('/' + customeList)
                }
              
            } else{
                List.find({},function(err,navList){
                    if(!err){
                        res.render('index',{listType:foundList.name,itemList:foundList.item,navbarItem:navList})
                    }
                })
                               
            }
        }
    })

})

app.post('/delete',(req,res)=>{
    const deleteItem = req.body.checkbox;   
    const listType = req.body.listType;
    if(listType==='Today'){
        Item.findByIdAndRemove(deleteItem,function(err){   // deleting items form row
            if(!err){
                res.redirect('/')
            }
            
        })
    }
    else{
        List.findOneAndUpdate({name:listType},{$pull: {item: {_id: deleteItem}}},function(err){
            if(!err){
                res.redirect('/'+ listType)
            }
        })
    }
    
})

app.post("/trashBin",(req,res)=>{

    const trashData = req.body.trashBin;
    if(trashData==='Today'){
        res.redirect('/')
    }
    else{
        List.findOne({name:trashData},function(err,foundData){
            if(!err){
                List.findByIdAndRemove(foundData._id,function(err){
                    if(!err){
                        res.redirect('/')
                    }
                })
            }
        })
    }
})


app.post('/type',(req,res)=>{                                       // posting custom form data 
    res.redirect('/'+ req.body.customeListType)
})



connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("listening for requests");
    })
})