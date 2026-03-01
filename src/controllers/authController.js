import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verifica se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: "Usuário já existe" });
    }

    const user = new User({
      nome,
      email,
      senha,
    });

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    user.senha = await bcrypt.hash(senha, salt);

    // Salva no Banco de Dados
    await user.save();

    res.json({ msg: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Usuário não encontrado" });
    }
    const crypt = await bcrypt.compare(senha, user.senha);

    if (!crypt) {
      return res.status(400).json({ msg: "Senha incorreta" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ msg: "Login bem-sucedido!", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
};
