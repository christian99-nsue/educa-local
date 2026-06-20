import { Request, Response } from "express";
import { loginUser } from "../services/authService";
import { googleLogin } from "../services/googleService";
import { microsoftLogin } from "../services/microsoftService";


//Login Normal
export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    const data = await loginUser(identifier, password);

    res.json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


//Google Login
export const googleAuth = async (req: any, res: any) => {
  try {
    const { token } = req.body;

    const data = await googleLogin(token);

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: "Error Google login" });
  }
};


// Microsoft Login
export const microsoftAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ message: "Token Microsoft requerido" });
      return;
    }

    const data = await microsoftLogin(idToken);

    res.json(data);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Error Microsoft login" });
  }
};
