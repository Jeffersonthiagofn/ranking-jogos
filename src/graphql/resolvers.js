import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const resolvers = {
  Query: {
    hello: () => "Server running successfully!",
  },
  
  Mutation: {
    // 1. Função de Login
    login: async (_, { email, senha }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const crypt = await bcrypt.compare(senha, user.senha);
      if (!crypt) {
        throw new Error("Incorrect password");
      }

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return { 
        msg: "Login successful!", 
        token: token 
      };
    },

    // 2. Função de Registro
    register: async (_, { nome, email, senha }) => {
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error("Email already registered");
      }

      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(senha, salt);

      const newUser = new User({
        nome,
        email,
        senha: encryptedPassword
      });

      await newUser.save();
      return "User registered successfully!";
    }
  }
};