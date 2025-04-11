import express from 'express';
import cors from 'cors';
import { results } from './results.js';


const app = express();
app.use(cors(
   {
    origin: 'https://result-gray-five.vercel.app',
   }
));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post('/results',async (req,res)=>{
    const formData = req.body;
    console.log(formData);
    const data = await results(formData);
    res.send(data);
})

app.listen(8000,()=>{
    console.log('Server is running on port 8000')
})