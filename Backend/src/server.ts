import app from "./app";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import express from "express";

app.use(express.json());
app.use("/auth", authRoutes);

dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${process.env.PORT}`);
});
