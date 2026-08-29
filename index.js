import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./server/routes/routeindex.js";
dotenv.config();
const app=express();
const PORT=process.env.PORT || 8800;
app.use(cors("*"));
app.use(express.json({limit : "10mb"}));
app.use(express.urlencoded({extended :true}));
app.use("/api-v1",router);
app.use((req, res) => {
  res.status(404).json({
    status: "404 Not Found",
    message: "Route not found",
  });
});


app.listen(PORT,()=>{
    console.log(`Listening on Port : ${PORT}`);
    
})