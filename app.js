require('dotenv').config();

const fs = require('fs').promises;
const express = require('express');
const Io = require('./Io');

const warehouse = new Io('./warehouse.json');

const base = express();
base.use(express.json());

base.get('/', async (req,res) => {
    const Warehouse = await warehouse.read();
    const activeWarehouse = Warehouse.filter(item => item.amount > 0)
    res.status(200).json(activeWarehouse);
})

base.post('/', async (req, res) => {
    const {name, amount} = req.body;
    const Warehouse = await warehouse.read();
    const findItem = Warehouse.find((item) => item.name == name);
    if (findItem) {
        if (findItem.amount + amount >= 0) {
            findItem.amount += amount;
            await warehouse.write(Warehouse);
            res.status(200).json('Successfully renewed');
        } else {
            res.status(400).json(`You have only ${findItem.amount}`)
        }
    } else {
        const id = (Warehouse[Warehouse.length - 1]?.id || 0) + 1;
        const data = Warehouse.length ? [...Warehouse, {id,name,amount}] : [{id,name,amount}];
        await warehouse.write(data);
        res.status(201).json('Successfully added');
    };
    
})

base.put('/', async (req,res) => {
    const {id, name} = req.body;
    const Warehouse = await warehouse.read();
    const findItem = Warehouse.find((item) => item.id == id);
    findItem ? findItem.name = name : findItem.name;
    await warehouse.write(Warehouse);
    res.status(200).json('Successfully changed');
})

base.delete('/', async (req,res) => {
    const Warehouse = await warehouse.read();
    const {name} = req.body;
    const findId = Warehouse.find((item) => item.name == name);
    let itemId;
    if (findId) {
        itemId = findId.id - 1;
    };
    Warehouse.splice(itemId, 1);
    await warehouse.write(Warehouse);
    res.status(200).json('Successfully deleted');
})

const PORT = process.env.PORT;

base.listen(PORT,() => {
    console.log(PORT);
})