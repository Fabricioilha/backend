import 'dotenv/config';
import express from 'express';
import { authMiddleware } from './middlewares/authMiddleware.js';
import { UserService } from './services/User-services.js';
import jwt from 'jsonwebtoken';

const app = express();
const port = 3000;
app.use(express.json());

app.get("/", async (req, res)=>{
    res.send("Back end Works");
});

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;
    const userService = new UserService();
    const userLogged = await userService.login(email, password);
    if(userLogged){
        const secretKey = process.env.SECRET_KEY;
        const token = jwt.sign({user: userLogged}, secretKey ,{expiresIn: "3600s" })
        return res.status(200).json({token})
    }
    return res.status(400).json({Message: "Email ou senha inválido"});

})

app.use(authMiddleware);

app.post("/users", async (req, res)=>{
    const {name, email, password} = req.body;
    const user = {name, email, password};
    const userService = new UserService();
    await userService.create(user);
    return res.status(201).json({Message: `User ${user} created with success`})
})

// Listar Todos os usuários
app.get("/users", async (req, res)=>{
    const userService = new UserService();
    const users = await userService.findAll();
    return res.status(200).json(users);
})

// Procurar pelo ID
app.get("/users/:id", async(req, res)=>{
    const id = req.params.id;
    const userService = new UserService();
    const user = await userService.findById(id);
    if(user){return res.status(200).json(user);}
    return res.status(404).json({Message: "Usuário não encontrado!"});
})

// Deletar Usuário pelo ID
app.delete("/users/:id", async (req, res)=>{
    const id = req.params.id;
    const userService = new UserService();
    const user = await userService.findById(id);
    if(user){ 
        await userService.delete(id)
        return res.status(200).json({Message: "User deleted with success"});
    }else{
        return res.status(404).json({Message: "Usuário não encontrado!"});
    }
})

// Atualizar Usuário pelo ID
app.put("/users/:id", async (req, res)=>{
    const id = req.params.id;
    const {name, email, password} = req.body;
    const userData = {name, email, password}
    const userService = new UserService();
    const user = await userService.findById(id);
    if(user){ 
        await userService.update(id, userData);
        return res.status(200).json({Message: "User updated with success"});
    }
    return res.status(404).json({Message: "Usuário não encontrado!"});
})

app.listen(process.env.PORT || port, ()=>{
    console.log(`Runing at http://localhost:${port}`);
})