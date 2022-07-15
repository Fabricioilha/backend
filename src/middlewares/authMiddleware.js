import 'dotenv/config';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/User-services.js';

export const authMiddleware = async (req, res, next)=>{
    const authorization = await req.headers.authorization;
    const token = authorization ? authorization.split(" ")[1] : false;

    if(token){
        const secretKey = process.env.SECRET_KEY;
        jwt.verify(token, secretKey, {ignoreExpiration: false}, async (err, decodedToken)=>{
            if(err){
                return res.status(401).json(err);
            }
            else{
                const isValidToken = decodedToken && decodedToken.user;
    
                if(isValidToken){
                    const userService = new UserService();
                    const user = await userService.findByEmail(decodedToken.user.email);
                    if(user){
                        next();
                    }
                }else{
                    return res.status(401).json({Message: "Não autorizado."});
                }
            }
        })
    }else{
        return res.status(401).json({Message: "Não autorizado."})
    }
}