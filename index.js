```js
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log("SUPABASE_URL =", SUPABASE_URL);
console.log("SUPABASE_KEY exists =", !!SUPABASE_KEY);

const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_KEY || ""
);

app.get("/", (req, res) => {
  res.send("Pingis backend kör");
});

app.get("/players", async (req, res) => {

  const { data, error } = await supabase
    .from("players")
    .select("*");

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);

});

app.post("/start-tournament", async (req, res) => {

  try {

    const { data: players, error: playersError } =
      await supabase
        .from("players")
        .select("*");

    if (playersError) {

      return res.status(500).json({
        success:false,
        message:"Kunde inte hämta spelare",
        error:playersError.message
      });

    }

    if (!players || players.length < 2){

      return res.status(400).json({
        success:false,
        message:"Inte tillräckligt med spelare"
      });

    }

    const matchesToInsert=[];

    for(let i=0;i<players.length;i+=2){

      if(players[i+1]){

        matchesToInsert.push({

          activity_id:
            req.body.activity_id || null,

          player1_id:
            players[i].id,

          player2_id:
            players[i+1].id,

          status:"QUEUED"

        });

      }

    }

    const {
      data:matches,
      error:insertError
    } = await supabase
      .from("matches")
      .insert(matchesToInsert)
      .select();

    if(insertError){

      return res.status(500).json({

        success:false,
        message:"Kunde inte skapa matcher",
        error:insertError.message

      });

    }

    return res.json({

      success:true,
      message:"Turnering startad",
      matches

    });

  } catch(err){

    return res.status(500).json({

      success:false,
      message:"Serverfel",
      error:err.message

    });

  }

});

app.post("/create-league", async (req,res)=>{

  try{

    const {
      activity_id,
      players
    } = req.body;

    const matches=[];

    for(let i=0;i<players.length;i++){

      for(let j=i+1;j<players.length;j++){

        matches.push({

          activity_id,
          player1_id:players[i],
          player2_id:players[j],
          status:"QUEUED"

        });

      }

    }

    const { data,error } =
      await supabase
      .from("matches")
      .insert(matches)
      .select();

    if(error) throw error;

    res.json({
      success:true,
      matches:data
    });

  }catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

app.post("/create-tournament", async (req,res)=>{

  try{

    const {
      activity_id,
      players,
      poolSize
    } = req.body;

    const pools=[];

    for(
      let i=0;
      i<players.length;
      i+=poolSize
    ){

      pools.push(
        players.slice(i,i+poolSize)
      );

    }

    const matches=[];

    for(const pool of pools){

      for(let i=0;i<pool.length;i++){

        for(
          let j=i+1;
          j<pool.length;
          j++
        ){

          matches.push({

            activity_id,
            player1_id:pool[i],
            player2_id:pool[j],
            status:"QUEUED"

          });

        }

      }

    }

    const { data,error } =
      await supabase
      .from("matches")
      .insert(matches)
      .select();

    if(error) throw error;

    res.json({
      success:true,
      matches:data
    });

  }catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

app.post("/create-training", async (req,res)=>{

  try{

    const {
      activity_id,
      players
    } = req.body;

    const matches=[];

    for(let i=0;i<players.length;i++){

      for(let j=i+1;j<players.length;j++){

        matches.push({

          activity_id,
          player1_id:players[i],
          player2_id:players[j],
          status:"QUEUED"

        });

      }

    }

    const { data,error } =
      await supabase
      .from("matches")
      .insert(matches)
      .select();

    if(error) throw error;

    res.json({
      success:true,
      matches:data
    });

  }catch(err){

    res.status(500).json({
      success:false,
      error:err.message
    });

  }

});

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  "0.0.0.0",
  ()=>{

    console.log(
      "Backend kör på port",
      PORT
    );

  }
);
```
