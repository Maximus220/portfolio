const express = require('express');
var app = express();
const port = 3000;
var request = require("request");
const fs = require('fs');

app.use(express.static('./website'));

app.listen(port, () => {
  console.log('listening on *:'+port);
});

app.post("/projectList", (req,res)=>{
    res.json(projects);
})

app.post("/skillList", (req,res)=>{
    res.json(skills);
})

app.post("/videoList",(req,res)=>{
    res.json(videos);
})

var projects = JSON.parse(fs.readFileSync("./json/projects.json", 'utf8'));
var skills = JSON.parse(fs.readFileSync("./json/skills.json", 'utf8'));
var videos = JSON.parse(fs.readFileSync("./json/videos.json", 'utf8'));
var githubToken = JSON.parse(fs.readFileSync("./json/githubToken.json", 'utf8')).githubToken;

function syncGithub(){
    projects.forEach((p,i)=>{
        if(p.github){
            getGithubPage(p.github, (response, parsed)=>{
                // console.log(parsed)
                p.description = parsed.description;
                p.langList = parsed.langList;
                p.vibility = parsed.visibility;
                p.topics = parsed.topics;
                p.homepage = parsed.homepage;
                p.size = parsed.size;

                if(i==projects.length-1){
                    fs.writeFileSync("./json/projects.json", JSON.stringify(projects));
                }
            },true);
        }
    })
}
syncGithub();

function getGithubPage(repo, callback, hasLangList = false){
    if(repo && callback){
        request.get({url: "https://api.github.com/repos/Maximus220/"+repo, headers:{"Authorization":"Bearer "+githubToken, "User-Agent":"Mozilla/5.0"}}, (err, response, body)=>{
            if(!err){
                if(hasLangList){
                    getRepoLang(repo, (state, parsed)=>{
                        if(state){
                            let ans = JSON.parse(response.body);
                            ans['langList'] = parsed;
                            callback(response, ans);
                        }else{
                            callback(false);
                        }
                    });
                }else{
                    callback(response, JSON.parse(response.body));
                }
            }else{
                callback(false);
            }
        });
    }else{
        callback(false)
    }
}

function getRepoLang(repo, callback){
    if(repo && callback){
        request.get({url: "https://api.github.com/repos/Maximus220/"+repo+"/languages", headers:{"Authorization":"Bearer "+githubToken, "User-Agent":"Mozilla/5.0"}}, (err, response, body)=>{
            if(!err){
                callback(response, JSON.parse(response.body));
            }else{
                callback(false);
            }
        });
    }else{
        callback(false);
    }
}