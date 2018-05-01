"use strict";

const helper = require('jsdoc/util/templateHelper');
const taffy = require('taffydb').taffy;
const editor = require('./editor');
const path = require('jsdoc/path');
const fs = require('jsdoc/fs');
const child = require('child_process');

let data;

function find(spec) {
    return helper.find(data, spec);
}

exports.publish = function(taffyData, opts, tutorials) {
    const keys = [];
    const list = {};
    let p;
    data = taffyData;
    helper.setTutorials(tutorials);
    data = helper.prune(data);
    data.sort('longname, version, since');
    helper.addEventListeners(data);

    
    opts.destination.split('/').forEach((dir)=>{
        if(!p){
            p = path.join(process.cwd(),dir);
        }else{
            p = path.join(p,dir);
        }
        if(!fs.existsSync(p)) fs.mkdirSync(p);
    })
    

    data().each(function(doclet) {
        const url = helper.createLink(doclet);
        helper.registerLink(doclet.longname, url);
    });

    const members = helper.getMembers(data);
    members.tutorials = tutorials.children;
    editor.attachModuleSymbols(find({longname:{left:'module:'}}),members.modules);

    Object.keys(members).forEach((member)=>{
        keys.push(member);
        this[member] = taffy(members[member]);
    })

    Object.keys(helper.longnameToUrl).forEach((longname)=>{
        keys.forEach((key)=>{           
            const item = helper.find(this[key], {longname: longname});
            if(!item.length) return;
            if(!list[key]) list[key] = [];
            list[key] = list[key].concat(item);
        })
        
    })
    const file = path.join(p,'menu.json');
    const menu = JSON.stringify(editor.makeMenu(list,data),null,'\t');

    fs.writeFileSync(file,menu);
    const build = path.join(__dirname,'node_modules/.bin/react-scripts')
    
    const react = child.spawn(build,['build'],{
        cwd:__dirname
    });
    react.stdout.on('data',(data)=>{
        console.log(data.toString());
    })
    console.log(build)
}